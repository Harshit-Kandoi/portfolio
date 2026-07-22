import type { Request, Response } from 'express';
import crypto from 'crypto';

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

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: KEY_SECRET missing' }),
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const body = await req.json().catch(() => ({}));
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return new Response(
          JSON.stringify({ error: 'Missing required payment verification fields' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Payment verified successfully',
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid payment signature. Verification failed.',
          }),
          { status: 400, headers: corsHeaders }
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Internal server error during verification';
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
    }
  }

  // 2. Express / Dev Server (req, res)
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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('Missing RAZORPAY_KEY_SECRET environment variable');
    return res.status(500).json({ error: 'Server configuration error: KEY_SECRET missing' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (err: unknown) {
    console.error('Error verifying Razorpay payment:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error during verification';
    return res.status(500).json({ error: msg });
  }
}
