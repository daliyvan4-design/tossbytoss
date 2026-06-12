"use client";

import { PRODUCTS, fmt } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, use } from "react";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart, openDrawer, products: liveProducts } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);

  const found = PRODUCTS.find((p) => p.slug === slug);
  if (!found) return notFound();
  const product = found;

  const liveProduct = liveProducts.find((p) => p.ref === product.ref);
  const livePrice = liveProduct?.price ?? product.price;
  const stock = liveProduct?.stock ?? 99;
  const outOfStock = stock === 0;

  const currentTex = product.colors[activeColor].tex;

  function handleAdd() {
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleCommander() {
    addToCart(product.id);
    openDrawer();
  }

  /* couleur d'overlay selon le mode — assure lisibilité sur texture cuir */
  const panel = "rgba(10,10,10,0.55)";
  const panelLight = "rgba(245,242,236,0.72)";

  return (
    <main style={{ paddingTop: 100, minHeight: "100vh" }}>
      <style>{`
        .pdp-wrap { display: grid; grid-template-columns: 1fr 1fr; max-width: 1280px; margin: 0 auto; padding: 0 48px 80px; gap: 56px; align-items: start; }
        .pdp-breadcrumb { padding: 0 48px 32px; max-width: 1280px; margin: 0 auto; }
        .pdp-gallery { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 100px; }
        .pdp-info { background: var(--bg); padding: 40px 44px 44px; display: flex; flex-direction: column; gap: 0; box-shadow: 0 0 0 1px var(--hairline); }
        .pdp-title { font-family: var(--font-cormorant, Georgia, serif); font-style: italic; font-weight: 600; font-size: 52px; line-height: 1.02; letter-spacing: -0.01em; margin-bottom: 28px; }
        .pdp-price { font-family: var(--font-cormorant, Georgia, serif); font-style: italic; font-weight: 600; font-size: 46px; line-height: 1; }
        .pdp-related { border-top: 1px solid var(--hairline); padding: 64px 48px 80px; max-width: 1280px; margin: 0 auto; }
        @media (max-width: 860px) {
          .pdp-wrap { grid-template-columns: 1fr; padding: 0 24px 60px; gap: 32px; }
          .pdp-breadcrumb { padding: 0 24px 24px; }
          .pdp-gallery { position: static; }
          .pdp-info { padding: 28px 24px 32px; }
          .pdp-title { font-size: 38px; margin-bottom: 20px; }
          .pdp-price { font-size: 34px; }
          .pdp-related { padding: 40px 24px 56px; }
        }
        @media (max-width: 480px) {
          .pdp-wrap { padding: 0 16px 48px; gap: 24px; }
          .pdp-breadcrumb { padding: 0 16px 20px; }
          .pdp-info { padding: 22px 18px 24px; }
          .pdp-title { font-size: 32px; }
          .pdp-price { font-size: 28px; }
          .pdp-related { padding: 32px 16px 48px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <Link href="/marketplace" style={{
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          opacity: 0.6,
          textDecoration: "none",
        }}>
          ← La Collection
        </Link>
      </div>

      <div className="pdp-wrap">

        {/* ── Colonne gauche : galerie ── */}
        <div className="pdp-gallery">

          {/* Image principale */}
          <div style={{
            position: "relative",
            background: activeImg === 0
              ? `url('/assets/${currentTex}.png') center / cover no-repeat`
              : `url('${product.images[activeImg]}') center / cover no-repeat`,
            aspectRatio: "4/5",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 20, left: 20 }}>
              <span style={{
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "6px 14px",
                background: "#f5f2ec",
                color: "#0a0a0a",
              }}>
                {product.cat}
              </span>
            </div>
            <div style={{ position: "absolute", bottom: 20, right: 20 }}>
              <span style={{
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "#f5f2ec",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}>
                {product.ref}
              </span>
            </div>
          </div>

          {/* Miniatures */}
          <div style={{ display: "flex", gap: 10 }}>
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  flex: 1,
                  aspectRatio: "1",
                  background: i === 0
                    ? `url('/assets/${currentTex}.png') center / cover no-repeat`
                    : `url('${img}') center / cover no-repeat`,
                  border: activeImg === i ? "2px solid var(--fg)" : "2px solid transparent",
                  cursor: "pointer",
                  padding: 0,
                  outline: "none",
                  opacity: activeImg === i ? 1 : 0.55,
                  transition: "opacity 0.2s, border-color 0.2s",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Colonne droite : infos ── */}
        <div className="pdp-info">

          <div style={{
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            opacity: 0.55,
            marginBottom: 14,
          }}>
            {product.cat} · {product.ref}
          </div>

          <h1 className="pdp-title">
            {product.name}
          </h1>

          <p style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: 21,
            fontWeight: 500,
            lineHeight: 1.7,
            marginBottom: 36,
          }}>
            {product.description}
          </p>

          {/* ── Couleurs ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 14,
            }}>
              Coloris — <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 16, fontWeight: 500, opacity: 1 }}>{product.colors[activeColor].label}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => { setActiveColor(i); setActiveImg(0); }}
                  title={c.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c.hex,
                    border: activeColor === i
                      ? "3px solid var(--fg)"
                      : "2px solid var(--hairline)",
                    cursor: "pointer",
                    padding: 0,
                    outline: activeColor === i ? "2px solid var(--bg)" : "none",
                    outlineOffset: "-4px",
                    transition: "border-color 0.15s, outline 0.15s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Pointures (souliers uniquement) ── */}
          {product.sizes && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                opacity: 0.55,
                marginBottom: 14,
                display: "flex",
                justifyContent: "space-between",
              }}>
                <span>Pointure</span>
                {!activeSize && (
                  <span style={{ color: "rgba(200,80,60,0.85)", letterSpacing: "0.1em" }}>Sélectionner</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSize(s)}
                    style={{
                      width: 52,
                      height: 44,
                      border: activeSize === s ? "2px solid var(--fg)" : "1px solid var(--hairline)",
                      background: activeSize === s ? "var(--fg)" : "transparent",
                      color: activeSize === s ? "var(--bg)" : "var(--fg)",
                      fontFamily: "var(--font-jetbrains, monospace)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Détails ── */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 14,
            }}>
              Composition & détails
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {product.details.map((d) => (
                <li key={d} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.4, flexShrink: 0 }}>—</span>
                  <span style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 18, fontWeight: 500, lineHeight: 1.4 }}>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Prix + CTA ── */}
          <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 32, display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="pdp-price">
              {fmt(livePrice)}
            </div>

            {outOfStock && (
              <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,100,100,0.85)" }}>
                Rupture de stock
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleCommander}
                disabled={outOfStock}
                style={{
                  flex: 1,
                  padding: "18px 32px",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  border: "none",
                  fontFamily: "var(--font-jetbrains, monospace)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  cursor: outOfStock ? "default" : "pointer",
                  opacity: outOfStock ? 0.35 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                Commander →
              </button>
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                style={{
                  padding: "18px 24px",
                  background: "transparent",
                  color: "var(--fg)",
                  border: "1px solid var(--hairline)",
                  fontFamily: "var(--font-jetbrains, monospace)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: outOfStock ? "default" : "pointer",
                  opacity: added ? 0.55 : outOfStock ? 0.35 : 1,
                  transition: "opacity 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {added ? "Ajouté ✓" : "+ Panier"}
              </button>
            </div>

            <div style={{
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.45,
            }}>
              Livraison Abidjan 1–2 j · International 5–10 j
            </div>
          </div>
        </div>
      </div>

      {/* ── Autres pièces ── */}
      <div className="pdp-related">
        <div style={{
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          opacity: 0.45,
          marginBottom: 36,
        }}>
          Autres pièces
        </div>
        <div style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 8 }}>
          {PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
            <Link key={p.slug} href={`/marketplace/${p.slug}`} style={{ textDecoration: "none", flexShrink: 0, width: 240 }}>
              <div style={{
                height: 300,
                background: `url('/assets/${p.tex}.png') ${p.pos} / cover no-repeat`,
                marginBottom: 16,
              }} />
              <div style={{
                fontFamily: "var(--font-cormorant, Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 20,
                marginBottom: 6,
              }}>
                {p.name}
              </div>
              <div style={{
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.55,
              }}>
                {fmt(p.price)}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </main>
  );
}
