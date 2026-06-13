"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { fmt } from "@/lib/products";

export default function CheckoutPage() {
  const { cart, cartLoaded, productsLoaded, products } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartItems = Array.from(cart.entries())
    .filter(([, qty]) => qty > 0)
    .map(([ref, qty]) => {
      const product = products.find((p) => p.ref === ref);
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
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur serveur.");
      setLoading(false);
    }
  }

  if (!cartLoaded || !productsLoaded) {
    return (
      <main style={{ padding: "120px 48px", background: "#0a0a0a", minHeight: "100vh" }} />
    );
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "grid", placeItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 28, color: "#f5f2ec", marginBottom: 16 }}>
            Redirection en cours…
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(245,242,236,0.35)" }}>
            Vous allez être redirigé vers Genius Pay
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main style={{ padding: "120px 48px", background: "#0a0a0a", minHeight: "100vh", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 24, color: "rgba(245,242,236,0.45)", textAlign: "center" }}>
        Votre panier est vide.
      </main>
    );
  }

  const INPUT = {
    background: "#0f0f0f",
    border: "1px solid rgba(245,242,236,0.22)",
    padding: "14px 16px",
    fontFamily: "var(--font-cormorant, Georgia, serif)",
    fontSize: 18,
    color: "#f5f2ec",
    outline: "none",
    width: "100%",
    borderRadius: 0,
  } as React.CSSProperties;

  const LABEL = {
    fontFamily: "var(--font-jetbrains, monospace)",
    fontSize: 9,
    letterSpacing: "0.28em",
    textTransform: "uppercase" as const,
    color: "rgba(245,242,236,0.55)",
    marginBottom: 2,
  };

  return (
    <main style={{ padding: "100px 0 80px", background: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px" }}>

        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(245,242,236,0.35)", marginBottom: 12 }}>
          Commande
        </div>
        <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1, color: "#f5f2ec", marginBottom: 56 }}>
          Finaliser ma commande
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 56, alignItems: "start" }}>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {[
              { field: "name",  label: "Nom complet",             type: "text",  placeholder: "Aminata Diallo" },
              { field: "email", label: "Adresse email",           type: "email", placeholder: "aminata@exemple.com" },
              { field: "phone", label: "Téléphone (Mobile Money)", type: "tel",   placeholder: "+225 07 00 00 00 00" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={LABEL}>{label}</label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={INPUT}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,242,236,0.55)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(245,242,236,0.22)"; }}
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
              style={{
                marginTop: 8,
                padding: "18px 36px",
                background: loading ? "rgba(245,242,236,0.08)" : "#f5f2ec",
                color: "#0a0a0a",
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                border: "none",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.2s",
                alignSelf: "flex-start",
              }}
            >
              {loading ? "Redirection…" : "Payer avec Genius Pay →"}
            </button>

            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, color: "rgba(245,242,236,0.3)", letterSpacing: "0.15em", marginTop: -12 }}>
              Paiement sécurisé · Mobile Money · Carte bancaire
            </div>
          </form>

          {/* Récapitulatif */}
          <div style={{ background: "#111", border: "1px solid rgba(245,242,236,0.10)", padding: "32px" }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(245,242,236,0.4)", marginBottom: 24 }}>
              Récapitulatif
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {cartItems.map((item) => (
                <div key={item.ref} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 18, color: "#f5f2ec", lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, color: "rgba(245,242,236,0.35)", marginTop: 4 }}>
                      × {item.qty}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, color: "#f5f2ec", whiteSpace: "nowrap", paddingTop: 2 }}>
                    {fmt(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(245,242,236,0.10)", marginTop: 24, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,242,236,0.4)" }}>
                Total
              </div>
              <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 30, color: "#f5f2ec" }}>
                {fmt(total)}
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(245,242,236,0.06)", marginTop: 20, paddingTop: 20, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, color: "rgba(245,242,236,0.25)", letterSpacing: "0.12em", lineHeight: 1.8 }}>
              Livraison Abidjan 1–2 j offerte<br />
              International 5–10 j sur devis
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
