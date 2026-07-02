import { notFound } from "next/navigation";
import { StatusForm } from "@/components/admin/StatusForm";
import { isDbConfigured, mockOrders } from "@/lib/mock-data";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " XOF"; }

async function getOrder(ref: string) {
  if (!isDbConfigured()) {
    return mockOrders.find((o) => o.ref === ref) ?? null;
  }
  const { db } = await import("@/lib/db");
  return db.order.findUnique({
    where: { ref },
    include: { items: { include: { product: { select: { name: true, ref: true } } } } },
  });
}

export default async function CommandeDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrder(ref);
  if (!order) notFound();

  return (
    <>
      <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 03 — Commandes</div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>{order.ref}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 16 }}>Articles</div>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(245,242,236,0.07)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{item.product.name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, marginTop: 2 }}>× {item.qty} · {fmt(item.unitPrice)} / unité</div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 }}>{fmt(item.unitPrice * item.qty)}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16 }}>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28 }}>{fmt(order.total)}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 24 }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>Client</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 18 }}>{order.customerName}</div>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.5, marginTop: 6 }}>{order.customerEmail}</div>
            {order.customerPhone && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.5, marginTop: 4 }}>{order.customerPhone}</div>}
          </div>
          <StatusForm orderRef={order.ref} currentStatus={order.status} currentTracking={(order as any).trackingNumber} />
        </div>
      </div>
    </>
  );
}
