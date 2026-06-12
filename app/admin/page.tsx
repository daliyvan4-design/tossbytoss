import Link from "next/link";
import { isDbConfigured, mockOrders, mockProducts, mockSubscribers, mockAccountingEntries } from "@/lib/mock-data";

function fmt(n: number) {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " XOF";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "rgba(245,190,60,0.9)" },
  PAID:      { label: "Payée",       color: "rgba(100,190,100,0.9)" },
  SHIPPED:   { label: "Expédiée",    color: "rgba(100,160,245,0.9)" },
  DELIVERED: { label: "Livrée",      color: "rgba(150,245,150,0.9)" },
  CANCELLED: { label: "Annulée",     color: "rgba(245,100,100,0.7)" },
};

async function getStats() {
  if (!isDbConfigured()) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidEntries = mockAccountingEntries.filter((e) => e.type === "SALE");
    return {
      revenueDay:       paidEntries.filter((e) => e.createdAt >= startOfDay).reduce((s, e) => s + e.amount, 0),
      revenueMonth:     paidEntries.filter((e) => e.createdAt >= startOfMonth).reduce((s, e) => s + e.amount, 0),
      pendingCount:     mockOrders.filter((o) => o.status === "PENDING").length,
      subscriberCount:  mockSubscribers.filter((s) => s.active).length,
      lowStock:         mockProducts.filter((p) => p.stock <= 5 && p.active).map((p) => ({ name: p.name, ref: p.ref, stock: p.stock })),
      recentOrders:     mockOrders.slice(0, 6),
      isMock: true,
    };
  }

  const { db } = await import("@/lib/db");
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [revenueDay, revenueMonth, pendingCount, subscriberCount, lowStock, recentOrders] = await Promise.all([
    db.accountingEntry.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfDay }, type: "SALE" } }),
    db.accountingEntry.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth }, type: "SALE" } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.subscriber.count({ where: { active: true } }),
    db.product.findMany({ where: { stock: { lte: 5 }, active: true }, select: { name: true, ref: true, stock: true }, orderBy: { stock: "asc" } }),
    db.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { ref: true, customerName: true, total: true, status: true, createdAt: true } }),
  ]);
  return {
    revenueDay: revenueDay._sum.amount ?? 0,
    revenueMonth: revenueMonth._sum.amount ?? 0,
    pendingCount, subscriberCount, lowStock, recentOrders, isMock: false,
  };
}

export default async function AdminDashboard() {
  const { revenueDay, revenueMonth, pendingCount, subscriberCount, lowStock, recentOrders, isMock } = await getStats();

  const STAT_STYLE = { border: "1px solid rgba(245,242,236,0.10)", padding: "28px 32px", display: "flex", flexDirection: "column" as const, gap: 8 };

  return (
    <>
      {isMock && (
        <div style={{ marginBottom: 32, padding: "14px 24px", border: "1px solid rgba(245,190,60,0.4)", background: "rgba(245,190,60,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,190,60,0.9)" }}>
            ⚠ Mode démo — données fictives
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.5, letterSpacing: "0.1em" }}>
            Configurez DATABASE_URL dans .env.local pour connecter la base de données
          </span>
        </div>
      )}

      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 01 — Dashboard</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Vue d'ensemble</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
        {[
          { label: "Revenus aujourd'hui", value: fmt(revenueDay) },
          { label: "Revenus ce mois",     value: fmt(revenueMonth) },
          { label: "Commandes en attente",value: String(pendingCount) },
          { label: "Abonnés newsletter",  value: String(subscriberCount) },
        ].map(({ label, value }) => (
          <div key={label} style={STAT_STYLE}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.45 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 36, lineHeight: 1.1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div style={{ border: "1px solid rgba(245,242,236,0.10)" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(245,242,236,0.10)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.55 }}>Commandes récentes</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                {["Réf.", "Client", "Montant", "Statut", "Date"].map((h) => (
                  <th key={h} style={{ padding: "12px 28px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const s = STATUS_LABELS[o.status] ?? { label: o.status, color: "white" };
                return (
                  <tr key={o.ref} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                    <td style={{ padding: "14px 28px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.7 }}>{o.ref}</td>
                    <td style={{ padding: "14px 28px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{o.customerName}</td>
                    <td style={{ padding: "14px 28px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10 }}>{fmt(o.total)}</td>
                    <td style={{ padding: "14px 28px" }}>
                      <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "14px 28px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4 }}>{o.createdAt.toLocaleDateString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ border: "1px solid rgba(245,242,236,0.10)" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(245,242,236,0.10)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.55 }}>Alertes stock bas</div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {lowStock.length === 0 && (
              <div style={{ padding: "32px 28px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17, opacity: 0.4 }}>Tous les stocks sont suffisants.</div>
            )}
            {lowStock.map((p) => (
              <div key={p.ref} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4, marginTop: 3 }}>{p.ref}</div>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 16, color: p.stock === 0 ? "rgba(245,100,100,0.9)" : "rgba(245,190,60,0.9)" }}>
                  {p.stock === 0 ? "RUPTURE" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
