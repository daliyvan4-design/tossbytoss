import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidateProductsCache } from "@/lib/cache";

export async function GET(_: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const product = await db.product.findUnique({ where: { ref } });
  if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const data = await req.json();
  const product = await db.product.update({
    where: { ref },
    data: {
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock),
      imageUrl: data.imageUrl,
      imagePos: data.imagePos,
      active: data.active,
    },
  });
  await invalidateProductsCache().catch(() => null);
  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  await db.product.update({ where: { ref }, data: { active: false } });
  await invalidateProductsCache().catch(() => null);
  return NextResponse.json({ ok: true });
}
