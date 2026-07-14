// Sandbox-only PayPal Orders v2 client. The base URL is hardcoded to the
// sandbox host regardless of which client id/secret are configured — see
// CLAUDE.md "Do not do yet: do not enable real payment processing outside
// sandbox/test mode."
const PAYPAL_SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal sandbox credentials are missing");
  }

  const res = await fetch(`${PAYPAL_SANDBOX_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal sandbox auth failed");
  const data = await res.json();
  return data.access_token;
}

export async function createSandboxOrder(
  amountEur: number,
  reference: string,
  plan: string
) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_SANDBOX_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        { reference_id: reference, amount: { currency_code: "EUR", value: amountEur.toFixed(2) } },
      ],
      application_context: {
        return_url: `${process.env.APP_URL}/paywall/paypal-return?plan=${plan}`,
        cancel_url: `${process.env.APP_URL}/paywall`,
      },
    }),
  });
  if (!res.ok) throw new Error("PayPal sandbox order creation failed");
  return res.json();
}

export async function captureSandboxOrder(orderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_SANDBOX_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("PayPal sandbox capture failed");
  return res.json();
}
