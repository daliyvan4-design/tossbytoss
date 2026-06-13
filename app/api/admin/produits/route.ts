import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidateProductsCache } from "@/lib/cache";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, ref, slug, category, price, stock, imageUrl, imagePos, texKey, description, details, colors, sizes, active } = data;

  if (!name || !ref || !price) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name,
      ref,
      slug: slug || ref,
      category: category ?? "",
      price: Number(price),
      stock: Number(stock ?? 0),
      imageUrl: imageUrl ?? "",
      imagePos: imagePos ?? "center",
      texKey: texKey ?? "leather-black",
      description: description ?? "",
      details: details ?? [],
      colors: colors ?? [],
      sizes: sizes ?? [],
      active: active ?? true,
    },
  });

  await invalidateProductsCache().catch(() => null);
  return NextResponse.json(product, { status: 201 });
}
