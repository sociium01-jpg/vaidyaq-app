/* eslint-env node */
const Razorpay = require('razorpay');

// Simple in-memory sliding window rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip) {
  const now = Date.now();
  const userLogs = rateLimitMap.get(ip) || [];
  const recentLogs = userLogs.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  
  if (recentLogs.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  recentLogs.push(now);
  rateLimitMap.set(ip, recentLogs);
  return false;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 1. Rate Limiting Check
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown_ip';
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers: { ...headers, 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Too many requests. Rate limit exceeded. Try again in 60s.' })
    };
  }

  // 2. Max Payload Size Check (Max 10KB)
  if (event.body && event.body.length > 10 * 1024) {
    return {
      statusCode: 413,
      headers,
      body: JSON.stringify({ error: 'Payload Too Large. Max allowed size is 10KB.' })
    };
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Razorpay keys not configured on server' })
      };
    }

    // 3. Field Allowlisting & Type Checking
    let rawBody;
    try {
      rawBody = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const allowedKeys = ['amount', 'bedsCount', 'selectedCycle'];
    const invalidKeys = Object.keys(rawBody).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Forbidden extra fields in payload: ${invalidKeys.join(', ')}` })
      };
    }

    const amountInINR = Number(rawBody.amount);
    if (!amountInINR || typeof amountInINR !== 'number' || isNaN(amountInINR) || amountInINR <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid positive numeric amount parameter is required' })
      };
    }

    // Convert to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountInINR * 100);

    if (amountInPaise < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Minimum order amount is 100 paise (₹1.00)' })
      };
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rec_${Date.now()}`
    };

    const order = await instance.orders.create(orderOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      })
    };
  } catch (error) {
    console.error('[create-order] Error creating Razorpay order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process order creation' })
    };
  }
};
