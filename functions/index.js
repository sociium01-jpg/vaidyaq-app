/* eslint-env node */
const { onRequest } = require("firebase-functions/v2/https");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Simple in-memory sliding window rate limiter per IP
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

// 1. Create Order GCP Cloud Function
exports.createOrder = onRequest({ cors: true, secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Rate Limiting
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
  if (isRateLimited(clientIp)) {
    res.set("Retry-After", "60");
    res.status(429).json({ error: "Too many requests. Rate limit exceeded. Try again in 60s." });
    return;
  }

  // Max Payload Size Check (10KB)
  const rawLength = req.rawBody ? req.rawBody.length : JSON.stringify(req.body || {}).length;
  if (rawLength > 10 * 1024) {
    res.status(413).json({ error: "Payload Too Large. Max allowed size is 10KB." });
    return;
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      res.status(500).json({ error: "Razorpay keys not configured on GCP Secret Manager" });
      return;
    }

    // Field Allowlisting
    const allowedKeys = ["amount", "bedsCount", "selectedCycle"];
    const invalidKeys = Object.keys(req.body || {}).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      res.status(400).json({ error: `Forbidden extra fields in payload: ${invalidKeys.join(', ')}` });
      return;
    }

    const amountInINR = Number(req.body.amount);

    if (!amountInINR || typeof amountInINR !== 'number' || isNaN(amountInINR) || amountInINR <= 0) {
      res.status(400).json({ error: "Valid positive numeric amount parameter is required" });
      return;
    }

    // Convert to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountInINR * 100);

    if (amountInPaise < 100) {
      res.status(400).json({ error: "Minimum order amount is 100 paise (₹1.00)" });
      return;
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rec_${Date.now()}`
    };

    const order = await instance.orders.create(orderOptions);

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("[createOrder] Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order on GCP Cloud Function" });
  }
});

// 2. Verify Payment Signature GCP Cloud Function
exports.verifyPayment = onRequest({ cors: true, secrets: ["RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Rate Limiting
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
  if (isRateLimited(clientIp)) {
    res.set("Retry-After", "60");
    res.status(429).json({ error: "Too many payment verification attempts. Rate limit exceeded." });
    return;
  }

  // Max Payload Size Check (10KB)
  const rawLength = req.rawBody ? req.rawBody.length : JSON.stringify(req.body || {}).length;
  if (rawLength > 10 * 1024) {
    res.status(413).json({ error: "Payload Too Large. Max allowed size is 10KB." });
    return;
  }

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      res.status(500).json({ error: "Razorpay secret key not configured on GCP Secret Manager" });
      return;
    }

    // Field Allowlisting
    const allowedKeys = ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"];
    const invalidKeys = Object.keys(req.body || {}).filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      res.status(400).json({ error: `Forbidden extra fields in payload: ${invalidKeys.join(', ')}` });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (
      typeof razorpay_order_id !== 'string' || 
      typeof razorpay_payment_id !== 'string' || 
      typeof razorpay_signature !== 'string' ||
      !razorpay_order_id.trim() ||
      !razorpay_payment_id.trim() ||
      !razorpay_signature.trim()
    ) {
      res.status(400).json({ error: "Missing or invalid required validation string fields" });
      return;
    }

    // Verify signature using HMAC-SHA256
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ error: "Signature verification failed. Invalid transaction." });
      return;
    }

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[verifyPayment] Error verifying payment signature:", error);
    res.status(500).json({ error: "Signature validation error" });
  }
});
