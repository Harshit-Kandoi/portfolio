// Contact form relay → Resend.
// Hardened against abuse: Netlify edge rate limit, per-instance limiter, origin allow-list,
// honeypot field, length caps, and HTML escaping of everything placed in the email body.

const ALLOWED_ORIGINS = [
  'https://harshitkandoi.in',
  'https://www.harshitkandoi.in',
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean),
];

const MAX_EMAIL = 254;
const MAX_SUBJECT = 150;
const MAX_MESSAGE = 5000;

// Second line of defence: Netlify may spread traffic across instances, so this only
// catches bursts that land on one warm instance. The edge rule in `config` is the real limit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Netlify deploy previews and the site's own *.netlify.app domain
  return /^https:\/\/[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app$/i.test(origin);
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const EMAIL_RE = /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i;

export default async (req: Request, context?: { ip?: string }) => {
  const origin = req.headers.get('origin') ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
  // Browsers always send Origin on cross-site POSTs; scripts calling us directly usually don't.
  if (!isAllowedOrigin(origin)) return reply(403, { error: 'Forbidden' });

  const ip = context?.ip ?? req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
  if (isRateLimited(ip)) return reply(429, { error: 'Too many messages. Please try again later.' });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return reply(400, { error: 'Invalid JSON' });

  // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
  if (typeof body.website === 'string' && body.website.trim()) return reply(200, { success: true });

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!email || !message) return reply(400, { error: 'Email and message are required' });
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return reply(400, { error: 'Invalid email address' });
  if (subject.length > MAX_SUBJECT || message.length > MAX_MESSAGE) return reply(413, { error: 'Message is too long' });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('send-email: RESEND_API_KEY is not set');
    return reply(500, { error: 'Email service is not configured' });
  }

  const safeSubject = escapeHtml(subject || 'Direct message');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? 'Portfolio <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO ?? 'hello@harshitkandoi.in'],
        reply_to: email,
        // Subject is a plain-text header; strip line breaks so it can't inject extra headers.
        subject: `[Portfolio] ${(subject || 'Direct message').replace(/[\r\n]+/g, ' ')}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
            <h2 style="margin-top: 0; font-size: 18px;">New message from your portfolio</h2>
            <p style="margin: 6px 0;"><strong>From:</strong> ${escapeHtml(email)}</p>
            <p style="margin: 6px 0;"><strong>Subject:</strong> ${safeSubject}</p>
            <p style="margin: 6px 0;"><strong>Received:</strong> ${new Date().toUTCString()}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${escapeHtml(message)}</div>
          </div>
        `,
      }),
    });

    if (response.ok) return reply(200, { success: true });
    console.error('send-email: Resend rejected the request', response.status, await response.text());
    return reply(502, { error: 'Could not send the message right now' });
  } catch (err) {
    console.error('send-email: request to Resend failed', err);
    return reply(502, { error: 'Could not send the message right now' });
  }
};

// Netlify edge rate limit (free plan: 2 code-based rules per site). Blocks with HTTP 429.
// A `path` is required for rate limiting. Both paths work: /portfolio/api/... is what the
// site calls (it lives under /portfolio/), /api/... keeps older clients working.
export const config = {
  path: ['/portfolio/api/send-email', '/api/send-email'],
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
