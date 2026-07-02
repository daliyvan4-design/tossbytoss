import { NextResponse } from "next/server";
import { getCachedProducts, setCachedProducts } from "@/lib/cache";
import type { Product, ProductColor } from "@/lib/products";

function parseArr<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

export async function GET() {
  const cached = await getCachedProducts().catch(() => null);
  if (cached) return NextResponse.json(cached);

  const { db } = await import("@/lib/db");
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  const products: Product[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    ref: p.ref,
    category: p.category,
    price: p.price,
    stock: p.stock,
    active: p.active,
    imageUrl: p.imageUrl,
    imagePos: p.imagePos,
    texKey: p.texKey,
    description: p.description,
    details: parseArr<string>(p.details),
    colors: parseArr<ProductColor>(p.colors),
    sizes: parseArr<string>(p.sizes),
  }));

  await setCachedProducts(products).catch(() => null);
  return NextResponse.json(products);
}
