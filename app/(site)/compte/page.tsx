import type { Metadata } from "next";
import { auth, googleEnabled } from "@/lib/auth";
import { AuthForms } from "@/components/account/AuthForms";
import { LogoutButton } from "@/components/account/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon Compte — Toss by Toss" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

export default async function ComptePage() {
  const session = await auth();
  const email = session?.user?.email;

  let orders: Awaited<ReturnType<typeof getOrders>> = [];
  if (email) orders = await getOrders(email);

  async function getOrders(customerEmail: string) {
    try {
      const { db } = await import("@/lib/db");
      return await db.order.findMany({
        where: { customerEmail: { equals: customerEmail, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true } } } } },
      });
    } catch {
      return [];
    }
  }

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
          <div>
            {/* Profil */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, border: "1px solid var(--hairline)", padding: "24px 28px", marginBottom: 48 }}>
              <div>
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22 }}>{session.user?.name ?? "—"}</div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, opacity: 0.5, marginTop: 4 }}>{email}</div>
              </div>
              <LogoutButton />
            </div>

            {/* Commandes */}
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.4, marginBottom: 24 }}>
              Mes commandes — {orders.length}
            </div>

            {orders.length === 0 ? (
              <p style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 19, opacity: 0.4, textAlign: "center", padding: "60px 0" }}>
                Aucune commande pour le moment.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {orders.map((o) => (
                  <div key={o.ref} style={{ border: "1px solid var(--hairline)", padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, letterSpacing: "0.15em" }}>{o.ref}</span>
                      <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                        {STATUS_LABELS[o.status] ?? o.status} · {o.createdAt.toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17, opacity: 0.75, marginBottom: 10 }}>
                      {o.items.map((i) => `${i.product.name} ×${i.qty}`).join(" · ")}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 20 }}>{fmt(o.total)}</span>
                      {o.trackingNumber && (
                        <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.55, letterSpacing: "0.1em" }}>
                          Suivi : {o.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
