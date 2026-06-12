import Link from "next/link";
import { isDbConfigured, mockProducts } from "@/lib/mock-data";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getProducts() {
  if (!isDbConfigured()) return mockProducts;
  const { db } = await import("@/lib/db");
  return db.product.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function AdminProduitsPage() {
  const products = await getProducts();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 02 — Catalogue</div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Produits</h1>
        </div>
        <Link href="/admin/produits/nouveau" style={{ padding: "12px 24px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", textDecoration: "none" }}>
          + Nouveau
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
            {["Réf.", "Nom", "Prix", "Stock", "Statut", ""].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.ref} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.6 }}>{p.ref}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{p.name}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10 }}>{fmt(p.price)}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 14, color: p.stock === 0 ? "rgba(245,100,100,0.9)" : p.stock <= 5 ? "rgba(245,190,60,0.9)" : "inherit" }}>{p.stock}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", opacity: p.active ? 0.7 : 0.3 }}>{p.active ? "Actif" : "Inactif"}</td>
              <td style={{ padding: "14px 20px" }}>
                <Link href={`/admin/produits/${p.ref}`} style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none" }}>Modifier →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
