import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  const { status } = await req.json();
  const order = await db.order.update({
    where: { ref },
    data: { status },
  });
  return NextResponse.json(order);
}
