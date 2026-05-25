// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { tasksInWindow, type PlantInput, type TaskBucket } from '../_shared/schedule.ts';
import { renderDigestEmail } from '../_shared/email.ts';
import { signUnsubscribe } from '../_shared/unsubscribe.ts';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
}

interface GardenRow {
  id: string;
  name: string;
  last_frost_date: string | null;
  beds: { id: string; name: string; planting_slots: { plant_id: string | null }[] }[];
}

interface PlantRow {
  id: string;
  slug: string;
  common_name: string;
  emoji: string;
  sow_indoors_days_before_frost: number | null;
  direct_sow_days_before_frost: number | null;
  transplant_days_after_frost: number | null;
  days_to_maturity_min: number | null;
  days_to_maturity_max: number | null;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const UNSUBSCRIBE_SECRET = Deno.env.get('UNSUBSCRIBE_SECRET') ?? 'dev-secret-change-me';
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') ?? 'https://kvadratodling.se';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Kvadratodling <noreply@kvadratodling.se>';
const DRY_RUN_OVERRIDE_EMAIL = Deno.env.get('DRY_RUN_OVERRIDE_EMAIL') ?? '';

function mondayOfWeek(d: Date): string {
  // ISO week start (Mon). Returns YYYY-MM-DD. Local time intentional —
  // the digest is "this week for the user", not a UTC concept.
  const day = d.getDay(); // 0 = Sun, 1 = Mon, … 6 = Sat
  const diff = (day === 0 ? -6 : 1 - day);
  const m = new Date(d);
  m.setDate(m.getDate() + diff);
  return m.toISOString().slice(0, 10);
}

function plantInputFrom(plant: PlantRow): PlantInput {
  return {
    id: plant.id,
    slug: plant.slug,
    commonName: plant.common_name,
    emoji: plant.emoji,
    sowIndoorsDaysBeforeFrost: plant.sow_indoors_days_before_frost,
    directSowDaysBeforeFrost: plant.direct_sow_days_before_frost,
    transplantDaysAfterFrost: plant.transplant_days_after_frost,
    daysToMaturityMin: plant.days_to_maturity_min,
    daysToMaturityMax: plant.days_to_maturity_max,
  };
}

async function sendViaResend(toEmail: string, subject: string, html: string): Promise<string> {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [toEmail],
      subject,
      html,
      headers: {
        // One-click unsubscribe (RFC 8058) — Gmail/Outlook show the
        // built-in unsub button, drastically reducing spam reports.
        'List-Unsubscribe': `<${APP_BASE_URL}/api/email/unsubscribe?token=${await signUnsubscribe(toEmail, UNSUBSCRIBE_SECRET)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`resend ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.id as string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dry_run') === '1';

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const weekStart = mondayOfWeek(now);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 7);

  // 1. Eligible users
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('weekly_digest_enabled', true);

  if (usersErr) {
    return new Response(JSON.stringify({ error: usersErr.message }), { status: 500 });
  }

  // 2. All active plants once (small table, cached across users)
  const { data: plants, error: plantsErr } = await supabase
    .from('plants')
    .select(
      'id, slug, common_name, emoji, sow_indoors_days_before_frost, direct_sow_days_before_frost, transplant_days_after_frost, days_to_maturity_min, days_to_maturity_max',
    )
    .eq('is_active', true);

  if (plantsErr) {
    return new Response(JSON.stringify({ error: plantsErr.message }), { status: 500 });
  }

  const plantsById = new Map((plants as PlantRow[]).map((p) => [p.id, p]));

  const counters = { processed: 0, sent: 0, skipped_empty: 0, skipped_opted_out: 0, failed: 0 };
  const errors: string[] = [];

  for (const user of (users ?? []) as UserRow[]) {
    counters.processed += 1;

    // Idempotency — if we already logged a run for this user this week, skip.
    const { data: existing } = await supabase
      .from('digest_runs')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (existing) continue;

    // Fetch gardens with planted slots
    const { data: gardens } = await supabase
      .from('gardens')
      .select(
        'id, name, last_frost_date, beds:beds(id, name, planting_slots(plant_id))',
      )
      .eq('user_id', user.id);

    const userGardens = (gardens ?? []) as GardenRow[];

    // Compute tasks across all gardens
    const gardenSections: { name: string; tasks: TaskBucket }[] = [];
    let totalTasks = 0;

    for (const garden of userGardens) {
      if (!garden.last_frost_date) continue;

      // Distinct plants planted in this garden
      const plantIds = new Set<string>();
      for (const bed of garden.beds ?? []) {
        for (const slot of bed.planting_slots ?? []) {
          if (slot.plant_id) plantIds.add(slot.plant_id);
        }
      }
      if (plantIds.size === 0) continue;

      const plantsForGarden: PlantInput[] = [];
      for (const id of plantIds) {
        const p = plantsById.get(id);
        if (p) plantsForGarden.push(plantInputFrom(p));
      }

      const tasks = tasksInWindow(
        new Date(garden.last_frost_date),
        plantsForGarden,
        now,
        windowEnd,
      );

      const taskTotal = tasks.sow_indoors.length + tasks.direct_sow.length
        + tasks.transplant.length + tasks.harvest_open.length;
      if (taskTotal === 0) continue;

      gardenSections.push({ name: garden.name, tasks });
      totalTasks += taskTotal;
    }

    if (totalTasks === 0) {
      counters.skipped_empty += 1;
      if (!dryRun) {
        await supabase.from('digest_runs').insert({
          user_id: user.id,
          week_start: weekStart,
          garden_count: userGardens.length,
          task_count: 0,
          status: 'skipped_empty',
        });
      }
      continue;
    }

    // Render + send
    const unsubToken = await signUnsubscribe(user.email, UNSUBSCRIBE_SECRET);
    const html = renderDigestEmail({
      userName: user.name,
      gardens: gardenSections,
      weekStart,
      appBaseUrl: APP_BASE_URL,
      unsubscribeUrl: `${APP_BASE_URL}/api/email/unsubscribe?token=${unsubToken}`,
    });

    const subject = `Den här veckan i odlingen 🌱 (${totalTasks} ${totalTasks === 1 ? 'sak' : 'saker'})`;
    const recipient = DRY_RUN_OVERRIDE_EMAIL || user.email;

    if (dryRun) {
      counters.sent += 1;
      continue;
    }

    try {
      const resendId = await sendViaResend(recipient, subject, html);
      await supabase.from('digest_runs').insert({
        user_id: user.id,
        week_start: weekStart,
        garden_count: gardenSections.length,
        task_count: totalTasks,
        status: 'sent',
        resend_id: resendId,
      });
      await supabase
        .from('users')
        .update({ weekly_digest_last_sent_at: new Date().toISOString() })
        .eq('id', user.id);
      counters.sent += 1;
    } catch (err: any) {
      counters.failed += 1;
      errors.push(`${user.id}: ${err.message ?? String(err)}`);
      await supabase.from('digest_runs').insert({
        user_id: user.id,
        week_start: weekStart,
        garden_count: gardenSections.length,
        task_count: totalTasks,
        status: 'failed',
        error_message: String(err.message ?? err).slice(0, 500),
      });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, week_start: weekStart, dry_run: dryRun, counters, errors }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
