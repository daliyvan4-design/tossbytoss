import { ProductForm } from "@/components/admin/ProductForm";

export default function NouveauProduitPage() {
  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
          / 02 — Catalogue
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>
          Nouveau produit
        </h1>
      </div>
      <ProductForm />
    </>
  );
}
