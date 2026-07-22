import type { Request, Response } from 'express';
import Razorpay from 'razorpay';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res?: any) {
  // 1. Netlify Functions (Web Standard Request / Response)
  if (req instanceof Request || (req && !res?.status && typeof req.json === 'function')) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay authentication failed: Credentials not configured' }),
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      const body = await req.json().catch(() => ({}));
      const { amount, currency = 'INR', receipt, notes } = body;
      const numericAmount = Number(amount);

      if (!amount || isNaN(numericAmount) || numericAmount < 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid amount. Minimum amount is 100 paise.' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.create({
        amount: Math.round(numericAmount),
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        ...(notes && typeof notes === 'object' ? { notes: notes as Record<string, string | number> } : {}),
      });

      return new Response(
        JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      return new Response(
        JSON.stringify({ error: errorObj.message || 'Failed to create Razorpay order' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // 2. Express Server / Dev Server (req, res)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Missing Razorpay credentials');
    return res.status(401).json({ error: 'Razorpay authentication failed: Credentials not configured' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is 100 paise.' });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options: Parameters<typeof razorpay.orders.create>[0] = {
      amount: Math.round(numericAmount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      ...(notes && typeof notes === 'object' ? { notes: notes as Record<string, string | number> } : {}),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: unknown) {
    console.error('Error creating Razorpay order:', err);
    const errorObj = err as { statusCode?: number; message?: string; error?: { code?: string; description?: string } };
    if (errorObj.statusCode === 401 || (errorObj.error && errorObj.error.code === 'BAD_REQUEST_ERROR' && errorObj.error.description?.includes('Authentication'))) {
      return res.status(401).json({ error: 'Razorpay API authentication failed' });
    }
    return res.status(500).json({ error: errorObj.message || 'Failed to create Razorpay order' });
  }
}
