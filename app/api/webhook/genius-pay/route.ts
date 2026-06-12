import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/genius-pay";
import { sendInvoice } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-geniuspay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "payment.success") {
    return NextResponse.json({ ok: true });
  }

  const orderRef: string = event.order_ref;

  const order = await db.order.findUnique({
    where: { ref: orderRef },
    include: {
      items: { include: { product: { select: { id: true, name: true, ref: true } } } },
    },
  });

  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ ok: true });
  }

  await db.$transaction([
    db.order.update({ where: { ref: orderRef }, data: { status: "PAID" } }),
    ...order.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      })
    ),
    db.accountingEntry.create({
      data: {
        amount: order.total,
        type: "SALE",
        ref: `ACC-${orderRef}`,
        orderId: order.id,
      },
    }),
  ]);

  await db.subscriber
    .upsert({
      where: { email: order.customerEmail },
      update: {},
      create: { email: order.customerEmail, source: "CHECKOUT" },
    })
    .catch(console.error);

  await sendInvoice({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderRef,
    orderDate: order.createdAt.toLocaleDateString("fr-FR"),
    items: order.items.map((i) => ({
      name: i.product.name,
      ref: i.product.ref,
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    total: order.total,
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
