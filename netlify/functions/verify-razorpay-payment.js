/* global process */
import crypto from 'crypto';


export async function handler(event, context) {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSandbox } = data;

    // Sandbox / developer mock checkout validation
    if (isSandbox || (razorpay_order_id && razorpay_order_id.startsWith('sandbox-order-'))) {
      console.log("[verify-razorpay-payment] Verifying sandbox/developer mode simulated payment.");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ verified: true, message: "Sandbox payment verified successfully" })
      };
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required Razorpay payment details" })
      };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Razorpay Key Secret is not configured on the server." })
      };
    }

    // Cryptographically calculate and verify signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn("[verify-razorpay-payment] Signature verification failed.");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ verified: false, error: "Invalid payment signature" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ verified: true, message: "Payment signature verified successfully" })
    };

  } catch (error) {
    console.error("[verify-razorpay-payment] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
