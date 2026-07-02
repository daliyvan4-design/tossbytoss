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
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 02 — Catalogue</div>
          <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>Produits</h1>
        </div>
        <Link href="/admin/produits/nouveau" style={{ padding: "12px 24px", background: "rgba(17,17,17,0.9)", color: "#ffffff", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", textDecoration: "none" }}>
          + Nouveau
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(17,17,17,0.08)" }}>
            {["", "Réf.", "Nom", "Prix", "Stock", "Statut", ""].map((h, i) => (
              <th key={i} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.ref} style={{ borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
              {/* Thumbnail */}
              <td style={{ padding: "10px 20px", width: 56 }}>
                <div style={{
                  width: 42, height: 52,
                  backgroundImage: p.imageUrl ? `url('${p.imageUrl}')` : `url('/assets/leather-black.png')`,
                  backgroundSize: "cover",
                  backgroundPosition: (p as { imagePos?: string }).imagePos ?? "center",
                  opacity: p.active ? 1 : 0.35,
                  flexShrink: 0,
                }} />
              </td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, opacity: 0.6 }}>{p.ref}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 17 }}>{p.name}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10 }}>{fmt(p.price)}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 14, color: p.stock === 0 ? "rgba(192,58,43,0.9)" : p.stock <= 5 ? "rgba(176,124,16,0.9)" : "inherit" }}>{p.stock}</td>
              <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: p.active ? 0.7 : 0.3 }}>{p.active ? "Actif" : "Inactif"}</td>
              <td style={{ padding: "14px 20px" }}>
                <Link href={`/admin/produits/${p.ref}`} style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none" }}>Modifier →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
