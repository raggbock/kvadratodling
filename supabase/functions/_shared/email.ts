import type { TaskBucket, TaskItem } from './schedule.ts';

interface RenderInput {
  userName: string | null;
  gardens: { name: string; tasks: TaskBucket }[];
  weekStart: string; // YYYY-MM-DD
  appBaseUrl: string;
  unsubscribeUrl: string;
}

const KIND_META: Record<keyof TaskBucket, { label: string; color: string; icon: string }> = {
  sow_indoors:  { label: 'Så inomhus',   color: '#7c3aed', icon: '🌱' },
  direct_sow:   { label: 'Så utomhus',   color: '#0284c7', icon: '🌾' },
  transplant:   { label: 'Plantera ut',  color: '#059669', icon: '🪴' },
  harvest_open: { label: 'Börja skörda', color: '#d97706', icon: '🧺' },
};

const MONTH_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function formatDateSv(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

function relativeSv(daysFromNow: number): string {
  if (daysFromNow <= 0) return 'idag';
  if (daysFromNow === 1) return 'imorgon';
  return `om ${daysFromNow} dagar`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

function taskRow(item: TaskItem, color: string, utm: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-size:14px;line-height:1.5;color:#1f2937;">
        <span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:999px;margin-right:8px;vertical-align:middle;"></span>
        <a href="${utm}" style="color:#1f2937;text-decoration:none;">
          <strong>${escapeHtml(item.emoji)} ${escapeHtml(item.commonName)}</strong>
        </a>
        <span style="color:#6b7280;">— ${escapeHtml(relativeSv(item.daysFromNow))} (${escapeHtml(formatDateSv(item.date))})</span>
      </td>
    </tr>`;
}

function bucketBlock(
  bucket: TaskItem[],
  meta: { label: string; color: string; icon: string },
  appBaseUrl: string,
): string {
  if (bucket.length === 0) return '';
  const rows = bucket.map((item) =>
    taskRow(item, meta.color, `${appBaseUrl}/catalog/${encodeURIComponent(item.slug)}?utm_source=digest&utm_medium=email`),
  ).join('');
  return `
    <div style="margin-top:18px;">
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;letter-spacing:0.02em;color:${meta.color};text-transform:uppercase;">
        ${meta.icon} ${meta.label}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
    </div>`;
}

function gardenSection(
  garden: { name: string; tasks: TaskBucket },
  appBaseUrl: string,
): string {
  const blocks = (['sow_indoors', 'direct_sow', 'transplant', 'harvest_open'] as const)
    .map((k) => bucketBlock(garden.tasks[k], KIND_META[k], appBaseUrl))
    .join('');
  return `
    <div style="margin-top:24px;padding:18px 20px;border:1px solid #e5e7eb;border-radius:12px;background:#fafdf7;">
      <h2 style="margin:0;font-size:17px;font-weight:700;color:#111827;">${escapeHtml(garden.name)}</h2>
      ${blocks}
    </div>`;
}

export function renderDigestEmail(input: RenderInput): string {
  const greeting = input.userName ? `Hej ${escapeHtml(input.userName.split(' ')[0])}!` : 'Hej!';
  const totalTasks = input.gardens.reduce(
    (sum, g) =>
      sum + g.tasks.sow_indoors.length + g.tasks.direct_sow.length
        + g.tasks.transplant.length + g.tasks.harvest_open.length,
    0,
  );

  const sections = input.gardens.map((g) => gardenSection(g, input.appBaseUrl)).join('');

  return `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>Den här veckan i odlingen</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f7faf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      ${totalTasks} ${totalTasks === 1 ? 'sak' : 'saker'} att göra i odlingen den här veckan.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7faf7;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <div style="font-size:22px;line-height:1;">🌱</div>
              <div style="margin-top:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;color:#16a34a;">KVADRATODLING</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.3;font-weight:700;color:#111827;">${greeting}</h1>
              <p style="margin:0 0 4px 0;font-size:15px;line-height:1.55;color:#4b5563;">
                Den här veckan har du <strong>${totalTasks} ${totalTasks === 1 ? 'sak' : 'saker'}</strong> att göra i odlingen.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              ${sections}
              <div style="margin-top:28px;text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                  <tr><td bgcolor="#16a34a" style="border-radius:8px;">
                    <a href="${input.appBaseUrl}/gardens?utm_source=digest&utm_medium=email&utm_campaign=weekly"
                       style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Öppna mina odlingar
                    </a>
                  </td></tr>
                </table>
              </div>
            </td>
          </tr>
          <tr><td style="padding:0 32px;"><div style="height:1px;background:#f0fdf4;"></div></td></tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;">
              <p style="margin:0;font-size:12px;line-height:1.55;color:#9ca3af;">
                Du får det här mailet eftersom du har minst en odling på Kvadratodling och inte stängt av veckotipsen.
                Vill du sluta få dem? <a href="${input.unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Avregistrera med ett klick</a>.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
