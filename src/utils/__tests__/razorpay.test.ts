import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import createOrderHandler from '../../../api/create-order';
import verifyPaymentHandler from '../../../api/verify-payment';

const mockOrdersCreate = vi.fn();

vi.mock('razorpay', () => {
  return {
    default: class MockRazorpay {
      orders = {
        create: mockOrdersCreate,
      };
    },
  };
});

interface MockReqOptions {
  method?: string;
  body?: Record<string, unknown>;
}

function createMockReqRes(options: MockReqOptions = {}) {
  const req = {
    method: options.method || 'GET',
    body: options.body,
  } as unknown as Request;

  let statusCode = 0;
  let jsonResponse: Record<string, unknown> | null = null;
  let ended = false;

  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockImplementation((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn().mockImplementation((data: unknown) => {
      jsonResponse = data as Record<string, unknown>;
      return res;
    }),
    end: vi.fn().mockImplementation(() => {
      ended = true;
      return res;
    }),
  } as unknown as Response;

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
    isEnded: () => ended,
  };
}

describe('Razorpay Integration Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = 'rzp_test_TG6oFSJdLLYnaL';
    process.env.RAZORPAY_KEY_SECRET = 'yJyk0nDsTnNSOw3pyj1RqQUD';
  });

  describe('Backend Endpoint: /api/create-order', () => {
    it('should handle OPTIONS preflight requests with status 200', async () => {
      const { req, res, getStatusCode, isEnded } = createMockReqRes({ method: 'OPTIONS' });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(200);
      expect(isEnded()).toBe(true);
    });

    it('should return 405 if HTTP method is not POST', async () => {
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({ method: 'GET' });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(405);
      expect(getJsonResponse()).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 if amount is missing or less than 100 paise', async () => {
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: { amount: 50 },
      });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(400);
      expect(getJsonResponse()?.error).toContain('Minimum amount is 100 paise');
    });

    it('should return 401 if Razorpay credentials are missing', async () => {
      delete process.env.RAZORPAY_KEY_ID;
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: { amount: 500 },
      });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(401);
      expect(getJsonResponse()?.error).toContain('authentication failed');
    });

    it('should successfully create a Razorpay order', async () => {
      mockOrdersCreate.mockResolvedValueOnce({
        id: 'order_test_999',
        amount: 500,
        currency: 'INR',
      });

      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: { amount: 500, currency: 'INR', receipt: 'rcpt_1' },
      });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(200);
      expect(getJsonResponse()).toEqual({
        order_id: 'order_test_999',
        amount: 500,
        currency: 'INR',
      });
      expect(mockOrdersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          currency: 'INR',
          receipt: 'rcpt_1',
        })
      );
    });

    it('should return 500 error if Razorpay order creation fails', async () => {
      mockOrdersCreate.mockRejectedValueOnce(new Error('Razorpay API Timeout'));

      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: { amount: 1000 },
      });

      await createOrderHandler(req, res);
      expect(getStatusCode()).toBe(500);
      expect(getJsonResponse()?.error).toBe('Razorpay API Timeout');
    });
  });

  describe('Backend Endpoint: /api/verify-payment', () => {
    it('should handle OPTIONS preflight requests with status 200', async () => {
      const { req, res, getStatusCode, isEnded } = createMockReqRes({ method: 'OPTIONS' });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(200);
      expect(isEnded()).toBe(true);
    });

    it('should return 405 if HTTP method is not POST', async () => {
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({ method: 'GET' });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(405);
      expect(getJsonResponse()).toEqual({ error: 'Method not allowed' });
    });

    it('should return 500 if RAZORPAY_KEY_SECRET is missing', async () => {
      delete process.env.RAZORPAY_KEY_SECRET;
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({ method: 'POST', body: {} });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(500);
      expect(getJsonResponse()?.error).toContain('KEY_SECRET missing');
    });

    it('should return 400 if required signature fields are missing', async () => {
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: { razorpay_order_id: 'order_123' },
      });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(400);
      expect(getJsonResponse()?.error).toContain('Missing required payment verification fields');
    });

    it('should return 200 success when signature matches HMAC SHA256', async () => {
      const secret = process.env.RAZORPAY_KEY_SECRET!;
      const order_id = 'order_test_123';
      const payment_id = 'pay_test_456';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: order_id,
          razorpay_payment_id: payment_id,
          razorpay_signature: validSignature,
        },
      });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(200);
      const responseData = getJsonResponse();
      expect(responseData?.success).toBe(true);
      expect(responseData?.order_id).toBe(order_id);
      expect(responseData?.payment_id).toBe(payment_id);
    });

    it('should return 400 failure when signature does not match', async () => {
      const { req, res, getStatusCode, getJsonResponse } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_456',
          razorpay_signature: 'invalid_signature_hash',
        },
      });

      await verifyPaymentHandler(req, res);
      expect(getStatusCode()).toBe(400);
      const responseData = getJsonResponse();
      expect(responseData?.success).toBe(false);
      expect(responseData?.error).toContain('Invalid payment signature');
    });
  });
});
