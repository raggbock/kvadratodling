import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribe } from '@/lib/unsubscribe';

// Handles both:
//   - GET  (user clicked the unsubscribe link in the email)
//   - POST (RFC 8058 one-click — Gmail/Outlook button)
//
// In both cases: verify the HMAC token, flip weekly_digest_enabled to false,
// then respond. GET returns an HTML confirmation; POST returns 204.

async function handle(req: NextRequest, isPost: boolean) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    console.error('[unsubscribe] UNSUBSCRIBE_SECRET not configured');
    return new NextResponse('Server misconfigured', { status: 500 });
  }

  const email = await verifyUnsubscribe(token, secret);
  if (!email) {
    return new NextResponse('Invalid or expired link', { status: 400 });
  }

  // Service-role client — the user isn't logged in when they click an
  // unsubscribe link, and we don't want them to have to be.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[unsubscribe] supabase env missing');
    return new NextResponse('Server misconfigured', { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { error } = await supabase
    .from('users')
    .update({ weekly_digest_enabled: false })
    .eq('email', email.toLowerCase());

  if (error) {
    console.error('[unsubscribe] update failed:', error.message);
    return new NextResponse('Server error', { status: 500 });
  }

  if (isPost) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(
    `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Avregistrerad — Kvadratodling</title>
    <style>
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7faf7; color: #1f2937; }
      .card { max-width: 480px; margin: 80px auto; padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; text-align: center; }
      h1 { margin: 16px 0 8px; font-size: 22px; color: #111827; }
      p { margin: 8px 0; font-size: 15px; color: #4b5563; line-height: 1.55; }
      a { color: #16a34a; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="font-size:36px;">🌱</div>
      <h1>Avregistrerad</h1>
      <p>Vi skickar inte fler veckotips till <strong>${email}</strong>.</p>
      <p style="margin-top:20px;font-size:13px;color:#9ca3af;">Ångrar du dig? Logga in och slå på det igen i <a href="https://kvadratodling.se/settings">inställningarna</a>.</p>
    </div>
  </body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function GET(req: NextRequest) {
  return handle(req, false);
}

export async function POST(req: NextRequest) {
  return handle(req, true);
}
