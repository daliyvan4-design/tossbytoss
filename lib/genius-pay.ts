import crypto from "crypto";

const BASE = process.env.GENIUSPAY_BASE_URL ?? "https://api.geniuspay.io/v1";

interface InitiateParams {
  amount: number;
  currency: "XOF";
  orderRef: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  webhookUrl: string;
}

interface InitiateResponse {
  paymentUrl: string;
  paymentRef: string;
}

export async function initiatePayment(params: InitiateParams): Promise<InitiateResponse> {
  const res = await fetch(`${BASE}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GENIUSPAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      order_ref: params.orderRef,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
        phone: params.customerPhone,
      },
      return_url: params.returnUrl,
      webhook_url: params.webhookUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GeniusPay initiate failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { paymentUrl: data.payment_url, paymentRef: data.payment_ref };
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}
