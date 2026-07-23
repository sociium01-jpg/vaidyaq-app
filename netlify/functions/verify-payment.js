/* eslint-env node */
const crypto = require('crypto');

// In-memory rate limiting map
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
      body: JSON.stringify({ error: 'Too many payment verification attempts. Rate limit exceeded.' })
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
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Razorpay keys not configured on server' })
      };
    }

    // 3. Field Allowlisting & Type Checking
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const allowedKeys = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'];
    const invalidKeys = Object.keys(body).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Forbidden extra fields in payload: ${invalidKeys.join(', ')}` })
      };
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (
      typeof razorpay_order_id !== 'string' || 
      typeof razorpay_payment_id !== 'string' || 
      typeof razorpay_signature !== 'string' ||
      !razorpay_order_id.trim() ||
      !razorpay_payment_id.trim() ||
      !razorpay_signature.trim()
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid required validation string fields' })
      };
    }

    // 4. Verify signature using HMAC-SHA256
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Signature verification failed. Invalid transaction signature.' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Payment verified successfully' })
    };
  } catch (error) {
    console.error('[verify-payment] Error verifying payment signature:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Signature validation error' })
    };
  }
};
