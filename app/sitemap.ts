import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tossbytoss.ci";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/marketplace`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/moodboard`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/cgv`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/politique-retours`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const { db } = await import("@/lib/db");
    const products = await db.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE}/marketplace/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
