import type { Metadata } from "next";
import { auth, googleEnabled } from "@/lib/auth";
import { AuthForms } from "@/components/account/AuthForms";
import { LogoutButton } from "@/components/account/LogoutButton";
import { NewsletterToggle } from "@/components/account/NewsletterToggle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon Compte — Toss by Toss" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "rgba(200,150,60,0.9)",
  PAID: "rgba(80,160,100,0.9)",
  SHIPPED: "rgba(90,150,220,0.9)",
  DELIVERED: "rgba(80,160,100,0.9)",
  CANCELLED: "rgba(200,80,60,0.85)",
};

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getAccountData(email: string) {
  try {
    const { db } = await import("@/lib/db");
    const [orders, sub] = await Promise.all([
      db.order.findMany({
        where: { customerEmail: { equals: email, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true, ref: true } } } } },
      }),
      db.subscriber.findUnique({ where: { email: email.toLowerCase() } }),
    ]);
    return { orders, newsletterActive: !!sub?.active };
  } catch {
    return { orders: [], newsletterActive: false };
  }
}

export default async function ComptePage() {
  const session = await auth();
  const email = session?.user?.email;

  const { orders, newsletterActive } = email
    ? await getAccountData(email)
    : { orders: [], newsletterActive: false };

  return (
    <main style={{ paddingTop: 160, position: "relative", zIndex: 2, minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 120px" }}>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", opacity: 0.35, marginBottom: 18 }}>
            {email ? "Espace personnel" : "Identification"}
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(38px, 6vw, 64px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            {email ? <>Bonjour, <em>{session.user?.name?.split(" ")[0] ?? "vous"}</em></> : <>Mon <em>Compte</em></>}
          </h1>
        </div>

        {!email ? (
          <AuthForms googleEnabled={googleEnabled} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

            {/* Profil */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, border: "1px solid var(--hairline)", padding: "24px 28px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22 }}>{session.user?.name ?? "—"}</div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, opacity: 0.5, marginTop: 4 }}>{email}</div>
              </div>
              <LogoutButton />
            </div>

            {/* Préférences */}
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.4, marginBottom: 16 }}>
                Préférences
              </div>
              <NewsletterToggle initialActive={newsletterActive} />
            </div>

            {/* Commandes */}
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.4, marginBottom: 20 }}>
                Mes commandes — {orders.length}
              </div>

              {orders.length === 0 ? (
                <p style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 19, opacity: 0.4, textAlign: "center", padding: "60px 0", border: "1px solid var(--hairline)" }}>
                  Aucune commande pour le moment.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {orders.map((o) => (
                    <div key={o.ref} style={{ border: "1px solid var(--hairline)", padding: "22px 26px" }}>
                      {/* En-tête */}
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "baseline", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--hairline)" }}>
                        <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12, letterSpacing: "0.14em" }}>{o.ref}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[o.status] ?? "var(--fg)" }} />
                          <span style={{ color: STATUS_COLORS[o.status] ?? "var(--fg)" }}>{STATUS_LABELS[o.status] ?? o.status}</span>
                        </span>
                      </div>

                      {/* Articles */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {o.items.map((i) => (
                          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 13 }}>
                            <span style={{ opacity: 0.8 }}>
                              <span style={{ opacity: 0.5 }}>{i.qty} ×</span> {i.product.name}
                            </span>
                            <span style={{ opacity: 0.55, whiteSpace: "nowrap", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12 }}>{fmt(i.unitPrice * i.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pied */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10, paddingTop: 14, borderTop: "1px solid var(--hairline)" }}>
                        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.45, letterSpacing: "0.08em", lineHeight: 1.8 }}>
                          <div>Commandé le {o.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                          {o.trackingNumber && <div>Suivi : <span style={{ opacity: 0.85 }}>{o.trackingNumber}</span></div>}
                        </div>
                        <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22 }}>{fmt(o.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
