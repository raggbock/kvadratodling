// HMAC-signed unsubscribe tokens.
// Format: base64url(<email>) + '.' + base64url(hmac_sha256(secret, base64url(email)))
// Stateless — no DB lookup needed to validate. Secret rotation invalidates
// every outstanding token, which is the correct behaviour.

function bytesToBase64Url(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return new Uint8Array(sig);
}

export async function signUnsubscribe(email: string, secret: string): Promise<string> {
  const payload = bytesToBase64Url(new TextEncoder().encode(email.toLowerCase()));
  const sig = bytesToBase64Url(await hmac(secret, payload));
  return `${payload}.${sig}`;
}

export async function verifyUnsubscribe(token: string, secret: string): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = bytesToBase64Url(await hmac(secret, payload));
  // Constant-time compare
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    return new TextDecoder().decode(base64UrlDecode(payload));
  } catch {
    return null;
  }
}
