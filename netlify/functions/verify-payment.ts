import crypto from 'crypto';

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
};
