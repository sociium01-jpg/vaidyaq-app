/* eslint-env node */
const { onRequest } = require("firebase-functions/v2/https");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Create Order function
exports.createOrder = onRequest({ cors: true, secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      res.status(500).json({ error: "Razorpay keys not configured on GCP Secret Manager" });
      return;
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amountInINR = Number(req.body.amount);

    if (!amountInINR || isNaN(amountInINR)) {
      res.status(400).json({ error: "Valid amount parameter is required" });
      return;
    }

    // Convert to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountInINR * 100);

    if (amountInPaise < 100) {
      res.status(400).json({ error: "Minimum order amount is 100 paise (₹1.00)" });
      return;
    }

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
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

// Verify Signature function
exports.verifyPayment = onRequest({ cors: true, secrets: ["RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      res.status(500).json({ error: "Razorpay secret key not configured on GCP Secret Manager" });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing required validation fields" });
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
    res.status(500).json({ error: error.message || "Signature validation error" });
  }
});
