export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailedResponse {
  error?: {
    description?: string;
    reason?: string;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: RazorpayFailedResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export interface CheckoutOptions {
  amountInPaise: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (details: { paymentId: string; orderId: string; signature: string }) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[src*="checkout.razorpay.com"]');
  if (existingScript) {
    razorpayScriptPromise = new Promise((resolve) => {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => {
        razorpayScriptPromise = null;
        resolve(false);
      }, { once: true });
    });
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout({
  amountInPaise,
  currency = 'INR',
  name = 'Harshit Kandoi',
  description = 'Payment',
  image = '/favicon.svg',
  notes,
  prefill,
  onSuccess,
  onError,
  onDismiss,
}: CheckoutOptions): Promise<void> {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError?.('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    // Step 1: Create Order via Backend API
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes,
      }),
    });

    let orderData: { order_id?: string; amount?: number; currency?: string; error?: string } = {};
    try {
      const rawText = await response.text();
      orderData = JSON.parse(rawText);
    } catch {
      onError?.(`Server endpoint returned non-JSON response (${response.status}). Please check Netlify deployment logs.`);
      return;
    }

    if (!response.ok || !orderData.order_id) {
      const errorMsg = orderData.error || `Failed to create Razorpay order (HTTP ${response.status})`;
      onError?.(errorMsg);
      return;
    }

    const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const razorpayKey = (typeof envKey === 'string' && envKey.trim().length > 0)
      ? envKey.trim()
      : 'rzp_test_TG6oFSJdLLYnaL';

    // Step 2: Open Razorpay Modal
    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency,
      name,
      description,
      image,
      order_id: orderData.order_id,
      prefill: prefill || {
        name: 'Supporter',
        email: 'supporter@example.com',
      },
      theme: {
        color: '#f59e0b', // Amber theme
      },
      handler: async function (paymentResponse: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // Step 3: Verify Payment Signature via Backend API
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            onSuccess?.({
              paymentId: paymentResponse.razorpay_payment_id,
              orderId: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
            });
          } else {
            onError?.(verifyData.error || 'Payment signature verification failed.');
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error verifying payment signature';
          onError?.(msg);
        }
      },
      modal: {
        ondismiss: function () {
          onDismiss?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response: RazorpayFailedResponse) {
      const msg = response.error?.description || response.error?.reason || 'Payment failed';
      onError?.(msg);
    });

    rzp.open();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An error occurred during Razorpay checkout.';
    onError?.(msg);
  }
}
