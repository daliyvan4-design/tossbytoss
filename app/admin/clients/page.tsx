export const dynamic = "force-dynamic";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getClients() {
  const { db } = await import("@/lib/db");
  const [users, orderStats] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" } }),
    db.order.groupBy({
      by: ["customerEmail"],
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);
  const statsByEmail = new Map(orderStats.map((s) => [s.customerEmail.toLowerCase(), s]));
  return users.map((u) => {
    const stats = statsByEmail.get(u.email.toLowerCase());
    return {
      ...u,
      orderCount: stats?._count._all ?? 0,
      totalSpent: stats?._sum.total ?? 0,
    };
  });
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 04 — Clients</div>
        <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontWeight: 600, fontSize: 40, lineHeight: 1 }}>Clients</h1>
      </div>

      <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>
        {clients.length} compte{clients.length > 1 ? "s" : ""} créé{clients.length > 1 ? "s" : ""}
      </div>

      {clients.length === 0 ? (
        <p style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 15, opacity: 0.4, padding: "48px 0" }}>
          Aucun compte client pour le moment. Les comptes sont facultatifs — les clients peuvent commander sans s&apos;inscrire.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(17,17,17,0.10)" }}>
              {["Nom", "Email", "Inscription", "Commandes", "Total dépensé", "Créé le"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.45, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(17,17,17,0.07)" }}>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 14, fontWeight: 500 }}>{c.name ?? "—"}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 13, opacity: 0.7 }}>{c.email}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 12, opacity: 0.55, textTransform: "capitalize" }}>{c.provider === "google" ? "Google" : "Email"}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 13 }}>{c.orderCount}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 13 }}>{c.totalSpent > 0 ? fmt(c.totalSpent) : "—"}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 12, opacity: 0.45 }}>{c.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
