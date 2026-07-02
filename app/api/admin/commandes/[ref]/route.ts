import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStatusUpdate } from "@/lib/resend";

export async function GET(_: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await db.order.findUnique({
    where: { ref },
    include: {
      items: { include: { product: { select: { name: true, ref: true } } } },
    },
  });
  if (!order) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const { status, trackingNumber } = await req.json();

  const order = await db.order.update({
    where: { ref },
    data: { status, ...(trackingNumber !== undefined && { trackingNumber }) },
  });

  if (status === "SHIPPED" || status === "DELIVERED") {
    sendStatusUpdate({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderRef: order.ref,
      status,
      trackingNumber: order.trackingNumber ?? undefined,
    }).catch(console.error);
  }

  return NextResponse.json(order);
}
