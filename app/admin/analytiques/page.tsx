import { isDbConfigured, mockRevenueByMonth, mockBestSellers, mockOrders, mockAccountingEntries } from "@/lib/mock-data";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getData() {
  if (!isDbConfigured()) {
    const paidOrders = mockOrders.filter((o) => ["PAID","SHIPPED","DELIVERED"].includes(o.status));
    const totalRevenue = mockAccountingEntries.filter((e) => e.type === "SALE").reduce((s, e) => s + e.amount, 0);
    return { revenueByMonth: mockRevenueByMonth, bestSellers: mockBestSellers, totalRevenue, totalOrders: paidOrders.length };
  }
  const { db } = await import("@/lib/db");
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1), label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
  });
  const paidOrderIds = await db.order.findMany({
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    select: { id: true },
  }).then((orders) => orders.map((o) => o.id));

  const [bestSellersRaw, revenueByMonth, totalRevenueAgg, totalOrders] = await Promise.all([
    db.orderItem.groupBy({ by: ["productId"], _sum: { qty: true }, where: { orderId: { in: paidOrderIds } }, orderBy: { _sum: { qty: "desc" } }, take: 8 }),
    Promise.all(months.map((m) => db.accountingEntry.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: m.start, lt: m.end }, type: "SALE" } }).then((r) => ({ label: m.label, amount: r._sum.amount ?? 0 })))),
    db.accountingEntry.aggregate({ _sum: { amount: true }, where: { type: "SALE" } }),
    db.order.count({ where: { status: { in: ["PAID","SHIPPED","DELIVERED"] } } }),
  ]);
  const productIds = bestSellersRaw.map((b) => b.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, ref: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const bestSellers = bestSellersRaw.map((b) => ({ name: productMap.get(b.productId)?.name ?? "—", ref: productMap.get(b.productId)?.ref ?? "—", qty: b._sum.qty ?? 0 }));
  return { revenueByMonth, bestSellers, totalRevenue: totalRevenueAgg._sum.amount ?? 0, totalOrders };
}

export default async function AnalytiquesPage() {
  const { revenueByMonth, bestSellers, totalRevenue, totalOrders } = await getData();
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.amount), 1);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 04 — Analytiques</div>
        <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>Analytiques</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 32 }}>
        {[{ label: "Chiffre d'affaires total", value: fmt(totalRevenue) }, { label: "Commandes payées", value: String(totalOrders) }].map(({ label, value }) => (
          <div key={label} style={{ border: "1px solid rgba(17,17,17,0.10)", padding: "28px 32px" }}>
            <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.45, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 36, lineHeight: 1.1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div style={{ border: "1px solid rgba(17,17,17,0.10)", padding: 28 }}>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 24 }}>Revenus — 6 derniers mois</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
            {revenueByMonth.map((m) => (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", background: "rgba(17,17,17,0.15)", height: Math.max(4, (m.amount / maxRevenue) * 140) }} title={fmt(m.amount)} />
                <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.1em", opacity: 0.4, textTransform: "uppercase" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid rgba(17,17,17,0.10)", padding: 28 }}>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>Meilleures ventes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bestSellers.map((b, i) => (
              <div key={b.ref} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, opacity: 0.25, minWidth: 20 }}>0{i + 1}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 17 }}>{b.name}</div>
                    <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, opacity: 0.35, marginTop: 2, letterSpacing: "0.15em" }}>{b.ref}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 12, opacity: 0.8 }}>{b.qty} vendus</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
