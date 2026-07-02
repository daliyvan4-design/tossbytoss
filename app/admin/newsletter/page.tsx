import { isDbConfigured, mockSubscribers } from "@/lib/mock-data";
import { NewsletterSendForm } from "@/components/admin/NewsletterSendForm";

async function getData() {
  if (!isDbConfigured()) {
    return { activeCount: mockSubscribers.filter((s) => s.active).length, subscribers: mockSubscribers };
  }
  const { db } = await import("@/lib/db");
  const [activeCount, subscribers] = await Promise.all([
    db.subscriber.count({ where: { active: true } }),
    db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { email: true, source: true, active: true, createdAt: true } }),
  ]);
  return { activeCount, subscribers };
}

export default async function NewsletterPage() {
  const { activeCount, subscribers } = await getData();

  return (
    <>
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(17,17,17,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 06 — Newsletter</div>
        <h1 style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontWeight: 600, fontSize: 48, lineHeight: 1 }}>Newsletter</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 16 }}>
            {activeCount} abonné{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(17,17,17,0.08)" }}>
                {["Email", "Source", "Statut", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.email} style={{ borderBottom: "1px solid rgba(17,17,17,0.06)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 16 }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5 }}>{s.source}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, opacity: s.active ? 0.7 : 0.3 }}>{s.active ? "Actif" : "Désabonné"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, opacity: 0.4 }}>{s.createdAt.toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <NewsletterSendForm />
      </div>
    </>
  );
}
