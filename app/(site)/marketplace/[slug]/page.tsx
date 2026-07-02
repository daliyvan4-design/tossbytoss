import type { Metadata } from "next";
import ProductClient from "./ProductClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { db } = await import("@/lib/db");
    const p = await db.product.findUnique({ where: { slug } });
    if (!p) return {};
    const title = `${p.name} — Toss by Toss`;
    const description = p.description
      || `${p.name} · Maroquinerie artisanale en cuir pleine fleur, fabriquée à Abidjan.`;
    return {
      title,
      description,
      openGraph: {
        title: p.name,
        description,
        siteName: "Toss by Toss",
        ...(p.imageUrl && {
          images: [{ url: p.imageUrl, width: 1200, height: 900, alt: p.name }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(p.imageUrl && { images: [p.imageUrl] }),
      },
    };
  } catch {
    return {};
  }
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductClient params={params} />;
}
