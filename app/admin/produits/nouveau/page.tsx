import { ProductForm } from "@/components/admin/ProductForm";

export default function NouveauProduitPage() {
  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
          / 02 — Catalogue
        </div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>
          Nouveau produit
        </h1>
      </div>
      <ProductForm />
    </>
  );
}
