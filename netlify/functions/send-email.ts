export default async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, subject, message } = body;

    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: 'Email and message are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: RESEND_API_KEY is not set' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio OS <onboarding@resend.dev>',
        to: ['hello@harshitkandoi.in'],
        reply_to: email.trim(),
        subject: `[Portfolio OS] ${subject ? subject.trim() : 'Direct Message'}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
            <h2 style="color: #c084fc; margin-top: 0; font-size: 20px;">⚡ New Transmission from Portfolio OS</h2>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
            <p style="margin: 8px 0; font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:${email.trim()}" style="color: #38bdf8;">${email.trim()}</a></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Subject:</strong> ${subject ? subject.trim() : 'No Subject'}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
            <p style="margin-bottom: 8px; font-size: 14px;"><strong>Message Payload:</strong></p>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; color: #f8fafc; font-size: 14px; border: 1px solid #475569;">
${message.trim()}
            </div>
            <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Transmitted via Harshit Kandoi's Portfolio OS Mail Bridge
            </footer>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ success: false, error: data }), { status: response.status, headers: corsHeaders });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
  }
};
