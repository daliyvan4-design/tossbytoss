import Link from "next/link";
import { isDbConfigured, mockOrders } from "@/lib/mock-data";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "rgba(245,190,60,0.9)" },
  PAID:      { label: "Payée",       color: "rgba(100,190,100,0.9)" },
  SHIPPED:   { label: "Expédiée",    color: "rgba(100,160,245,0.9)" },
  DELIVERED: { label: "Livrée",      color: "rgba(150,245,150,0.9)" },
  CANCELLED: { label: "Annulée",     color: "rgba(245,100,100,0.7)" },
};

async function getOrders(status?: string, page = 1) {
  if (!isDbConfigured()) {
    const filtered = status ? mockOrders.filter((o) => o.status === status) : mockOrders;
    return { orders: filtered, total: filtered.length, pages: 1 };
  }
  const { db } = await import("@/lib/db");
  const take = 20;
  const where = status ? { status: status as "PENDING" } : {};
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, take, skip: (page - 1) * take, orderBy: { createdAt: "desc" }, select: { ref: true, customerName: true, total: true, status: true, createdAt: true } }),
    db.order.count({ where }),
  ]);
  return { orders, total, pages: Math.ceil(total / take) };
}

export default async function AdminCommandesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { orders, pages } = await getOrders(sp.status, page);

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 03 — Commandes</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Commandes</h1>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[undefined, "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/commandes?status=${s}` : "/admin/commandes"}
            style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 14px", border: "1px solid rgba(245,242,236,0.15)", textDecoration: "none", opacity: sp.status === s || (!sp.status && !s) ? 1 : 0.4 }}>
            {s ? STATUS_LABELS[s].label : "Toutes"}
          </Link>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
            {["Réf.", "Client", "Montant", "Statut", "Date", ""].map((h) => (
              <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const s = STATUS_LABELS[o.status] ?? { label: o.status, color: "white" };
            return (
              <tr key={o.ref} style={{ borderBottom: "1px solid rgba(245,242,236,0.06)" }}>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.6 }}>{o.ref}</td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{o.customerName}</td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10 }}>{fmt(o.total)}</td>
                <td style={{ padding: "14px 20px" }}><span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: s.color }}>{s.label}</span></td>
                <td style={{ padding: "14px 20px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4 }}>{o.createdAt.toLocaleDateString("fr-FR")}</td>
                <td style={{ padding: "14px 20px" }}>
                  <Link href={`/admin/commandes/${o.ref}`} style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none" }}>Voir →</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/commandes?page=${p}${sp.status ? `&status=${sp.status}` : ""}`}
              style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, padding: "6px 12px", border: "1px solid rgba(245,242,236,0.15)", textDecoration: "none", opacity: p === page ? 1 : 0.4 }}>{p}</Link>
          ))}
        </div>
      )}
    </>
  );
}
