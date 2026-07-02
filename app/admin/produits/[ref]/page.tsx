import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduitPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const product = await db.product.findUnique({ where: { ref } });
  if (!product) notFound();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
          / 02 — Catalogue
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>
          {product.name}
        </h1>
      </div>
      <ProductForm
        initial={{
          name: product.name,
          ref: product.ref,
          slug: product.slug,
          category: product.category,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl ?? "",
          imagePos: product.imagePos ?? "center",
          texKey: product.texKey,
          description: product.description,
          details: ((product.details as unknown as string[]) ?? []).join("\n"),
          colors: JSON.stringify(product.colors ?? [], null, 2),
          sizes: ((product.sizes as unknown as string[]) ?? []).join(", "),
          active: product.active,
        }}
        isEdit
      />
    </>
  );
}
