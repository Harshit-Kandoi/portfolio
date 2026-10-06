interface CustomRequest {
  httpMethod?: string;
  method?: string;
  body?: unknown;
  json?: () => Promise<unknown>;
}

interface CustomResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (data: unknown) => void; end: () => void };
}

// Helper to normalize incoming request payload across Netlify Event, Web Request, and Express Req
async function getRequestDetails(req: CustomRequest): Promise<{ method: string; body: Record<string, unknown> }> {
  const method = (req?.httpMethod || req?.method || 'POST').toUpperCase();
  let body: Record<string, unknown> = {};

  if (typeof req?.body === 'string') {
    try {
      body = JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      body = {};
    }
  } else if (typeof req?.json === 'function') {
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  } else if (req?.body && typeof req.body === 'object') {
    body = req.body as Record<string, unknown>;
  }

  return { method, body };
}

// Helper to send response cleanly across Netlify, Web Request, and Express
function sendResponse(req: unknown, res: CustomResponse | undefined, statusCode: number, data: unknown) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json',
  };

  // Express / Vite Dev Server
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(statusCode).json(data);
  }

  // Web Standard Response (if environment supports Response class and req is Request)
  if (typeof Response !== 'undefined' && typeof Request !== 'undefined' && req instanceof Request) {
    return new Response(JSON.stringify(data), { status: statusCode, headers: corsHeaders });
  }

  // Netlify Function Event return format
  return {
    statusCode,
    headers: corsHeaders,
    body: data ? JSON.stringify(data) : '',
  };
}

export default async function handler(req: CustomRequest, res?: CustomResponse) {
  const { method, body } = await getRequestDetails(req);

  if (method === 'OPTIONS') {
    return sendResponse(req, res, 200, { ok: true });
  }

  if (method !== 'POST') {
    return sendResponse(req, res, 405, { error: 'Method not allowed' });
  }

  try {
    const { email, subject, message } = (body || {}) as {
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!email || !message) {
      return sendResponse(req, res, 400, { error: 'Email and message are required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable.');
      return sendResponse(req, res, 500, { error: 'Server configuration error: RESEND_API_KEY is not set' });
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
      return sendResponse(req, res, 200, { success: true, data });
    } else {
      return sendResponse(req, res, response.status, { success: false, error: data });
    }
  } catch (err: unknown) {
    console.error('Error in send-email API handler:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return sendResponse(req, res, 500, { error: msg });
  }
}
