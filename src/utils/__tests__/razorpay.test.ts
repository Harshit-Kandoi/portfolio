import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import createOrderHandler from '../../../api/create-order';
import verifyPaymentHandler from '../../../api/verify-payment';

describe('Razorpay Integration Unit Tests', () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_TG6oFSJdLLYnaL';
    process.env.RAZORPAY_KEY_SECRET = 'yJyk0nDsTnNSOw3pyj1RqQUD';
  });

  describe('Backend Endpoint: /api/create-order', () => {
    it('should return 405 if HTTP method is not POST', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = { method: 'GET' };
      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await createOrderHandler(req, res);
      expect(statusCode).toBe(405);
      expect(jsonResponse).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 if amount is less than 100 paise', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = { method: 'POST', body: { amount: 50 } };
      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await createOrderHandler(req, res);
      expect(statusCode).toBe(400);
      expect(jsonResponse.error).toContain('Minimum amount is 100 paise');
    });

    it('should return 401 if Razorpay credentials are missing', async () => {
      delete process.env.RAZORPAY_KEY_ID;
      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = { method: 'POST', body: { amount: 500 } };
      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await createOrderHandler(req, res);
      expect(statusCode).toBe(401);
      expect(jsonResponse.error).toContain('authentication failed');
    });
  });

  describe('Backend Endpoint: /api/verify-payment', () => {
    it('should return 400 if required signature fields are missing', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = { method: 'POST', body: { razorpay_order_id: 'order_123' } };
      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await verifyPaymentHandler(req, res);
      expect(statusCode).toBe(400);
      expect(jsonResponse.error).toContain('Missing required payment verification fields');
    });

    it('should return 200 success when signature matches HMAC SHA256', async () => {
      const secret = process.env.RAZORPAY_KEY_SECRET!;
      const order_id = 'order_test_123';
      const payment_id = 'pay_test_456';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = {
        method: 'POST',
        body: {
          razorpay_order_id: order_id,
          razorpay_payment_id: payment_id,
          razorpay_signature: validSignature,
        },
      };

      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await verifyPaymentHandler(req, res);
      expect(statusCode).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.order_id).toBe(order_id);
      expect(jsonResponse.payment_id).toBe(payment_id);
    });

    it('should return 400 failure when signature does not match', async () => {
      let statusCode = 0;
      let jsonResponse: any = null;

      const req: any = {
        method: 'POST',
        body: {
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_456',
          razorpay_signature: 'invalid_signature_hash',
        },
      };

      const res: any = {
        setHeader: vi.fn(),
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          jsonResponse = data;
          return res;
        },
      };

      await verifyPaymentHandler(req, res);
      expect(statusCode).toBe(400);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toContain('Invalid payment signature');
    });
  });
});
