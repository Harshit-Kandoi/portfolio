import Razorpay from 'razorpay';

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

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Missing Razorpay credentials on Netlify');
    return new Response(
      JSON.stringify({ error: 'Razorpay configuration missing: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set' }),
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

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error('Error in create-order Netlify function:', err);
    const errorObj = err as { message?: string };
    return new Response(
      JSON.stringify({ error: errorObj.message || 'Failed to create Razorpay order' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
