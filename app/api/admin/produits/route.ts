import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidateProductsCache } from "@/lib/cache";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, ref, category, price, stock, imageUrl, imagePos } = data;

  if (!name || !ref || !price) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name,
      ref,
      category: category ?? "",
      price: Number(price),
      stock: Number(stock ?? 0),
      imageUrl: imageUrl ?? "",
      imagePos: imagePos ?? "center",
    },
  });

  await invalidateProductsCache().catch(() => null);
  return NextResponse.json(product, { status: 201 });
}
