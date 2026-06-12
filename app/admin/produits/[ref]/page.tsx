import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduitPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const product = await db.product.findUnique({ where: { ref } });
  if (!product) notFound();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
          / 02 — Catalogue
        </div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>
          {product.name}
        </h1>
      </div>
      <ProductForm initial={{ ...product, imageUrl: product.imageUrl ?? "", imagePos: product.imagePos ?? "center" }} isEdit />
    </>
  );
}
