/* global process, Buffer */
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
    const { beds, cycle, email, name } = data;
    
    // Server-side price calculation to prevent client-side manipulation
    const bedsCount = Number(beds) || 50;
    const baseFee = bedsCount <= 20 ? 55999 : bedsCount <= 150 ? 129999 : 249999;
    
    // Quarterly is 30% of annual price
    const priceAmount = cycle === 'quarterly' ? Math.round(baseFee * 0.3) : baseFee;
    const gstVal = Math.round(priceAmount * 0.18);
    const totalAmountInRupees = priceAmount + gstVal;
    const totalAmountInPaise = totalAmountInRupees * 100; // Razorpay expects amount in paise

    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Developer Sandbox Mode Fallback
    if (!keyId || !keySecret) {
      console.warn("[create-razorpay-order] Razorpay credentials missing. Falling back to Developer Sandbox Mode.");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          isSandbox: true,
          amount: totalAmountInRupees,
          currency: "INR",
          orderId: `sandbox-order-${Date.now()}`
        })
      };
    }

    // Call Razorpay Order API using native Node.js fetch (supported in Node 18+)
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: totalAmountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          email: email || "",
          name: name || "",
          beds: bedsCount,
          cycle: cycle || "annually"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API error: ${response.status} - ${errorText}`);
    }

    const order = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isSandbox: false,
        orderId: order.id,
        amount: totalAmountInRupees,
        currency: "INR",
        keyId: keyId
      })
    };

  } catch (error) {
    console.error("[create-razorpay-order] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
