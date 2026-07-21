import type { Request, Response } from 'express';
import Razorpay from 'razorpay';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers for Vercel/Serverless deployment
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

    const options: any = {
      amount: Math.round(numericAmount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    if (notes && typeof notes === 'object') {
      options.notes = notes;
    }

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    if (err.statusCode === 401 || (err.error && err.error.code === 'BAD_REQUEST_ERROR' && err.error.description?.includes('Authentication'))) {
      return res.status(401).json({ error: 'Razorpay API authentication failed' });
    }
    return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
}
