import crypto from 'crypto';

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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('Missing RAZORPAY_KEY_SECRET environment variable');
    return sendResponse(req, res, 500, { error: 'Server configuration error: KEY_SECRET missing' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = (body || {}) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendResponse(req, res, 400, { error: 'Missing required payment verification fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return sendResponse(req, res, 200, {
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
    } else {
      return sendResponse(req, res, 400, {
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (err: unknown) {
    console.error('Error verifying Razorpay payment:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error during verification';
    return sendResponse(req, res, 500, { error: msg });
  }
}
