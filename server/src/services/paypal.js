const base = () => process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

async function accessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw Object.assign(new Error('PayPal authentication failed. Check your sandbox credentials.'), { status: 502 });
  return (await r.json()).access_token;
}

export async function createOrder({ amount, projectId, description }) {
  const token = await accessToken();
  const r = await fetch(`${base()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: String(projectId),
        description: description.slice(0, 120),
        amount: { currency_code: 'USD', value: amount.toFixed(2) },
      }],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw Object.assign(new Error('Could not create the PayPal order'), { status: 502 });
  return data;
}

export async function captureOrder(orderId) {
  const token = await accessToken();
  const r = await fetch(`${base()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) {
    // THIS LINE WILL PRINT THE REAL PAYPAL ERROR
    console.error('PAYPAL CAPTURE FAILED:', JSON.stringify(data, null, 2));
    throw Object.assign(new Error('PayPal could not capture this payment'), { status: 502 });
  }
  return data;
}
