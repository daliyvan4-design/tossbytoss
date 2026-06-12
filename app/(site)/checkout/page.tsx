"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmt } from "@/lib/products";

export default function CheckoutPage() {
  const { cart, products, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartItems = Array.from(cart.entries())
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      return { ref: product.ref, qty, name: product.name, price: product.price };
    })
    .filter(Boolean) as { ref: string; qty: number; name: string; price: number }[];

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(({ ref, qty }) => ({ ref, qty })),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      clearCart();
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur serveur.");
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main style={{ padding: "120px 48px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 24, opacity: 0.5, textAlign: "center" }}>
        Votre panier est vide.
      </main>
    );
  }

  return (
    <main style={{ padding: "100px 48px 80px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 12 }}>
        Commande
      </div>
      <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1, marginBottom: 48 }}>
        Finaliser ma commande
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { field: "name",  label: "Nom complet",               type: "text",  placeholder: "Aminata Diallo" },
            { field: "email", label: "Email",                      type: "email", placeholder: "aminata@exemple.com" },
            { field: "phone", label: "Téléphone (Mobile Money)",   type: "tel",   placeholder: "+225 07 00 00 00 00" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.55 }}>
                {label}
              </label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                style={{ background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "12px 16px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 17, color: "inherit", outline: "none", width: "100%" }}
              />
            </div>
          ))}

          {error && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)", letterSpacing: "0.1em" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, padding: "16px 32px", background: loading ? "rgba(245,242,236,0.08)" : "var(--fg)", color: "var(--bg)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}
          >
            {loading ? "Redirection..." : "Payer avec Genius Pay →"}
          </button>
        </form>

        <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: "28px" }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>
            Récapitulatif
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cartItems.map((item) => (
              <div key={item.ref} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 17 }}>{item.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, marginTop: 2 }}>× {item.qty}</div>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11 }}>{fmt(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(245,242,236,0.10)", marginTop: 20, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.45 }}>Total</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28 }}>{fmt(total)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
