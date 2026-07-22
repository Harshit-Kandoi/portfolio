import Razorpay from 'razorpay';

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
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      return res.status(200).end();
    }
    return sendResponse(req, res, 200, { ok: true });
  }

  if (method !== 'POST') {
    return sendResponse(req, res, 405, { error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Missing Razorpay credentials');
    return sendResponse(req, res, 401, { error: 'Razorpay authentication failed: Credentials not configured' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = (body || {}) as {
      amount?: number | string;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string | number>;
    };
    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return sendResponse(req, res, 400, { error: 'Invalid amount. Minimum amount is 100 paise.' });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      ...(notes && typeof notes === 'object' ? { notes: notes as Record<string, string | number> } : {}),
    });

    return sendResponse(req, res, 200, {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: unknown) {
    console.error('Error creating Razorpay order:', err);
    const errorObj = err as { message?: string };
    return sendResponse(req, res, 500, { error: errorObj.message || 'Failed to create Razorpay order' });
  }
}
