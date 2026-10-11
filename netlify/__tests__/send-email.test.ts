// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ORIGIN = 'https://www.harshitkandoi.in';

const post = (body: unknown, origin: string | null = ORIGIN) =>
  new Request('https://www.harshitkandoi.in/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: JSON.stringify(body),
  });

const valid = { email: 'visitor@example.com', subject: 'Hello', message: 'Hi there' };

describe('send-email function', () => {
  let handler: (req: Request, ctx?: { ip?: string }) => Promise<Response>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules(); // fresh in-memory rate limiter per test
    process.env.RESEND_API_KEY = 'test-key';
    fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    handler = (await import('../functions/send-email')).default;
  });

  afterEach(() => vi.unstubAllGlobals());

  it('sends a valid message from an allowed origin', async () => {
    const res = await handler(post(valid), { ip: '1.1.1.1' });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects requests without an allowed origin', async () => {
    expect((await handler(post(valid, null), { ip: '1.1.1.2' })).status).toBe(403);
    expect((await handler(post(valid, 'https://evil.example'), { ip: '1.1.1.2' })).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('escapes HTML and strips header line breaks', async () => {
    await handler(post({ ...valid, subject: 'Hi\r\nBcc: x@y.z', message: '<script>alert(1)</script>' }), { ip: '1.1.1.3' });
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.html).not.toContain('<script>');
    expect(sent.html).toContain('&lt;script&gt;');
    expect(sent.subject).not.toMatch(/[\r\n]/);
  });

  it('silently drops honeypot submissions', async () => {
    const res = await handler(post({ ...valid, website: 'spam.biz' }), { ip: '1.1.1.4' });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates email and length', async () => {
    expect((await handler(post({ ...valid, email: 'not-an-email' }), { ip: '1.1.1.5' })).status).toBe(400);
    expect((await handler(post({ ...valid, message: 'x'.repeat(5001) }), { ip: '1.1.1.5' })).status).toBe(413);
  });

  it('rate limits bursts from one IP', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await handler(post(valid), { ip: '9.9.9.9' })).status);
    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses[5]).toBe(429);
  });
});
