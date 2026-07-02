"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 24px 80px", position: "relative", zIndex: 2 }}>
      <style>{`
        .conf-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .conf-ctas a { white-space: nowrap; }
        @media (max-width: 560px) {
          .conf-ctas { flex-direction: column; align-items: stretch; }
          .conf-ctas a { display: block; text-align: center; padding: 16px 20px !important; letter-spacing: 0.2em !important; }
          .conf-wrap h1 { font-size: clamp(32px, 11vw, 44px) !important; }
          .conf-wrap p  { font-size: 17px !important; margin-bottom: 40px !important; }
          .conf-check   { margin-bottom: 28px !important; }
        }
      `}</style>
      <div className="conf-wrap" style={{ textAlign: "center", maxWidth: 560, width: "100%" }}>

        <div className="conf-check" style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid var(--fg)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          opacity: 0.8,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 11 9 16 18 7" />
          </svg>
        </div>

        <div style={{
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: 0.5,
          marginBottom: 16,
        }}>
          Commande reçue
        </div>

        <h1 style={{
          fontFamily: "var(--font-cormorant, Georgia, serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(40px, 7vw, 72px)",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          marginBottom: 24,
        }}>
          Merci pour votre commande
        </h1>

        {ref && (
          <div style={{
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.5,
            marginBottom: 32,
          }}>
            Réf. {ref}
          </div>
        )}

        <p style={{
          fontFamily: "var(--font-cormorant, Georgia, serif)",
          fontStyle: "italic",
          fontSize: 20,
          lineHeight: 1.65,
          opacity: 0.8,
          marginBottom: 52,
          maxWidth: "42ch",
          margin: "0 auto 52px",
        }}>
          Nous avons bien reçu votre commande. Notre équipe vous contactera sous 24 h pour confirmer les détails et organiser la livraison.
        </p>

        <div className="conf-ctas">
          <Link href="/marketplace" style={{
            padding: "16px 32px",
            background: "var(--fg)",
            color: "var(--bg)",
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>
            Continuer mes achats
          </Link>
          <Link href="/" style={{
            padding: "16px 32px",
            border: "1px solid var(--hairline)",
            color: "var(--fg)",
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>
            Accueil
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
