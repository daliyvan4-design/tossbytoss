import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const take = 20;

  const where = status
    ? { status: status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
    : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      take,
      skip: (page - 1) * take,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true, ref: true } } } },
      },
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, pages: Math.ceil(total / take) });
}
