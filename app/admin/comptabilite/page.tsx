import { isDbConfigured, mockAccountingEntries } from "@/lib/mock-data";
import { ComptaExport } from "@/components/admin/ComptaExport";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getEntries() {
  if (!isDbConfigured()) return mockAccountingEntries;
  const { db } = await import("@/lib/db");
  return db.accountingEntry.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { order: { select: { customerName: true } } } });
}

export default async function ComptabilitePage() {
  const entries = await getEntries();
  const totalSales   = entries.filter((e) => e.type === "SALE").reduce((s, e) => s + e.amount, 0);
  const totalRefunds = entries.filter((e) => e.type === "REFUND").reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 05 — Comptabilité</div>
          <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>Comptabilité</h1>
        </div>
        <ComptaExport />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {[{ label: "Total ventes", value: fmt(totalSales) }, { label: "Total remboursements", value: fmt(totalRefunds) }, { label: "Net", value: fmt(totalSales - totalRefunds) }].map(({ label, value }) => (
          <div key={label} style={{ border: "1px solid rgba(17,17,17,0.10)", padding: "24px 28px" }}>
            <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 28 }}>{value}</div>
          </div>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(17,17,17,0.08)" }}>
            {["Réf.", "Type", "Montant", "Client", "Date"].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, opacity: 0.6 }}>{e.ref}</td>
              <td style={{ padding: "12px 20px" }}>
                <span style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: e.type === "SALE" ? "rgba(29,122,62,0.9)" : "rgba(192,58,43,0.7)" }}>
                  {e.type === "SALE" ? "Vente" : "Remboursement"}
                </span>
              </td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11 }}>{fmt(e.amount)}</td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 16 }}>{e.order?.customerName ?? "—"}</td>
              <td style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, opacity: 0.4 }}>{e.createdAt.toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
