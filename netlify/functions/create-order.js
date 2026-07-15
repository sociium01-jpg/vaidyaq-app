/* eslint-env node */
const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
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

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const body = JSON.parse(event.body || '{}');
    const amountInINR = Number(body.amount);

    if (!amountInINR || isNaN(amountInINR)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid amount parameter is required' })
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
      body: JSON.stringify({ error: error.message || 'Failed to create order' })
    };
  }
};
