import crypto from "crypto";

const BASE = process.env.GENIUSPAY_BASE_URL ?? "http://pay.genius.ci/api/v1/merchant";

interface InitiateParams {
  amount: number;
  orderRef: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  successUrl: string;
  errorUrl: string;
}

interface InitiateResponse {
  checkoutUrl: string;
  paymentRef: string;
}

export async function initiatePayment(params: InitiateParams): Promise<InitiateResponse> {
  const res = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.GENIUSPAY_PUBLIC_KEY!,
      "X-API-Secret": process.env.GENIUSPAY_SECRET_KEY!,
    },
    body: JSON.stringify({
      amount: params.amount,
      description: `Commande Toss by Toss — ${params.orderRef}`,
      customer: {
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
      },
      success_url: params.successUrl,
      error_url: params.errorUrl,
      metadata: {
        order_id: params.orderRef,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GeniusPay initiate failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const data = json.data;

  return {
    checkoutUrl: data.checkout_url,
    paymentRef: data.reference,
  };
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
