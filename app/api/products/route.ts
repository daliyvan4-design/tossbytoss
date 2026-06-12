import { NextResponse } from "next/server";
import { isDbConfigured, mockProducts } from "@/lib/mock-data";
import { getCachedProducts, setCachedProducts } from "@/lib/cache";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      mockProducts.map((p) => ({ ref: p.ref, price: p.price, stock: p.stock, active: p.active }))
    );
  }

  const cached = await getCachedProducts().catch(() => null);
  if (cached) return NextResponse.json(cached);

  const { db } = await import("@/lib/db");
  const products = await db.product.findMany({
    select: { ref: true, price: true, stock: true, active: true },
  });

  await setCachedProducts(products).catch(() => null);
  return NextResponse.json(products);
}
