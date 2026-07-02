"use client";

import { useCart } from "@/contexts/CartContext";
import { fmt } from "@/lib/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, use } from "react";

export default function ProductClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart, openDrawer, products } = useCart();
  const [added, setAdded] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);

  const product = products.find((p) => p.slug === slug);

  if (products.length > 0 && !product) return notFound();
  if (!product) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22, opacity: 0.35 }}>
        Chargement…
      </main>
    );
  }

  const outOfStock = product.stock === 0;
  const hasColors  = product.colors.length > 0;
  const hasSizes   = product.sizes.length > 0;
  const currentTex = hasColors ? product.colors[activeColor].tex : product.texKey;
  const bgImage    = product.imageUrl ? `url('${product.imageUrl}')` : `url('/assets/${currentTex}.png')`;

  function handleAdd() {
    addToCart(product!.ref);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  function handleCommander() {
    addToCart(product!.ref);
    openDrawer();
  }

  const related = products.filter((p) => p.ref !== product.ref).slice(0, 4);

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 2 }}>
      <style>{`
        /* ── Layout principal ── */
        .pp-wrap {
          display: grid;
          grid-template-columns: 56fr 44fr;
          min-height: 100vh;
        }

        /* ── Image ── */
        .pp-img {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          background: var(--hairline);
        }
        .pp-img-bg {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 1200ms cubic-bezier(.16,1,.3,1);
        }
        .pp-img:hover .pp-img-bg { transform: scale(1.04); }

        /* gradient haut pour la nav */
        .pp-img::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(10,10,10,0.45) 0%, transparent 30%);
          pointer-events: none;
        }
        .pp-img-ref {
          position: absolute; bottom: 48px; right: 40px; z-index: 2;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.38em;
          text-transform: uppercase; color: rgba(245,242,236,0.55);
          writing-mode: vertical-rl;
        }
        .pp-img-back {
          position: absolute; top: 32px; left: 40px; z-index: 3;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.28em;
          text-transform: uppercase; color: rgba(245,242,236,0.6);
          text-decoration: none; transition: color 200ms;
          display: flex; align-items: center; gap: 10px;
        }
        .pp-img-back:hover { color: rgba(245,242,236,1); }
        .pp-img-back::before { content: "←"; font-size: 12px; }

        /* ── Info ── */
        .pp-info {
          padding: 120px 68px 100px 60px;
          display: flex; flex-direction: column;
          border-left: 1px solid var(--hairline);
        }

        .pp-cat {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.45em;
          text-transform: uppercase; opacity: 0.35; margin-bottom: 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .pp-cat::before { content: ""; width: 28px; height: 1px; background: currentColor; }

        .pp-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: clamp(52px, 6vw, 88px);
          line-height: 0.92; letter-spacing: -0.025em;
          margin-bottom: 44px;
        }

        .pp-desc {
          font-family: var(--serif); font-size: 19px; line-height: 1.78;
          opacity: 0.65; max-width: 34ch; margin-bottom: 48px;
        }

        .pp-section-label {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.32em;
          text-transform: uppercase; opacity: 0.38; margin-bottom: 16px;
        }

        /* Couleurs */
        .pp-colors { display: flex; gap: 10px; margin-bottom: 40px; align-items: center; }
        .pp-swatch {
          width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; border: 2px solid transparent;
          transition: box-shadow 180ms, border-color 180ms;
          box-shadow: 0 0 0 1px var(--hairline);
        }
        .pp-swatch:hover { box-shadow: 0 0 0 1px var(--fg); }
        .pp-swatch.active {
          border-color: var(--bg);
          box-shadow: 0 0 0 2px var(--fg);
        }

        /* Tailles */
        .pp-sizes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
        .pp-size {
          min-width: 52px; height: 44px; padding: 0 14px;
          border: 1px solid var(--hairline);
          background: transparent; color: var(--fg);
          font-family: var(--mono); font-size: 11px; font-weight: 600;
          cursor: pointer; transition: all 150ms;
        }
        .pp-size:hover { border-color: var(--fg); }
        .pp-size.active { background: var(--fg); color: var(--bg); border-color: var(--fg); }

        /* Détails */
        .pp-details { margin-bottom: 48px; }
        .pp-detail-item {
          display: flex; align-items: baseline; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid var(--hairline);
        }
        .pp-detail-item:first-child { border-top: 1px solid var(--hairline); }
        .pp-detail-dash { font-family: var(--mono); font-size: 9px; opacity: 0.28; flex-shrink: 0; }
        .pp-detail-text { font-family: var(--serif); font-size: 17px; line-height: 1.5; opacity: 0.75; }

        /* Prix + CTA */
        .pp-buy { margin-top: 8px; }
        .pp-price {
          font-family: var(--serif); font-style: italic;
          font-size: clamp(38px, 4vw, 56px); letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .pp-stock {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.28em;
          text-transform: uppercase; margin-bottom: 32px;
        }
        .pp-stock.out { color: rgba(200,80,60,0.75); }
        .pp-stock.in  { color: rgba(80,160,100,0.65); }

        .pp-ctas { display: flex; gap: 12px; margin-bottom: 24px; }
        .pp-btn-main {
          flex: 1; padding: 17px 28px;
          background: var(--fg); color: var(--bg); border: none;
          font-family: var(--mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.32em; text-transform: uppercase;
          cursor: pointer; transition: opacity 250ms;
        }
        .pp-btn-main:hover { opacity: 0.78; }
        .pp-btn-main:disabled { opacity: 0.22; cursor: default; }
        .pp-btn-add {
          padding: 17px 22px;
          background: transparent; color: var(--fg);
          border: 1px solid var(--hairline);
          font-family: var(--mono); font-size: 9px;
          letter-spacing: 0.22em; text-transform: uppercase;
          cursor: pointer; transition: border-color 200ms, opacity 200ms;
          white-space: nowrap;
        }
        .pp-btn-add:hover { border-color: var(--fg); }
        .pp-btn-add:disabled { opacity: 0.22; cursor: default; }
        .pp-btn-add.added { opacity: 0.38; }

        .pp-livraison {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em;
          text-transform: uppercase; opacity: 0.3; line-height: 1.9;
        }

        /* ── Autres pièces ── */
        .pp-related {
          padding: 80px 80px;
          border-top: 1px solid var(--hairline);
        }
        .pp-related-head {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.38em;
          text-transform: uppercase; opacity: 0.35;
          margin-bottom: 48px;
          display: flex; align-items: center; gap: 20px;
        }
        .pp-related-head::after { content: ""; flex: 1; height: 1px; background: var(--hairline); }
        .pp-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .pp-related-item { text-decoration: none; }
        .pp-related-img {
          aspect-ratio: 3/4;
          background-size: cover; background-position: center;
          margin-bottom: 20px;
          overflow: hidden;
          position: relative;
        }
        .pp-related-img::after {
          content: "";
          position: absolute; inset: 0;
          background: transparent;
          transition: background 400ms;
        }
        .pp-related-item:hover .pp-related-img::after {
          background: rgba(245,242,236,0.06);
        }
        .pp-related-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: 22px; line-height: 1.15; margin-bottom: 10px;
        }
        .pp-related-price {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; opacity: 0.45;
        }

        @media (max-width: 1024px) {
          .pp-wrap { grid-template-columns: 1fr; }
          .pp-img { position: relative; height: 80vw; }
          .pp-info { padding: 56px 40px 80px; border-left: none; border-top: 1px solid var(--hairline); }
          .pp-related { padding: 56px 40px; }
          .pp-related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .pp-img { height: 100vw; }
          .pp-info { padding: 40px 24px 64px; }
          .pp-related { padding: 40px 24px; }
          .pp-related-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .pp-ctas { flex-direction: column; }
        }
      `}</style>

      <div className="pp-wrap">

        {/* ── Image ── */}
        <div className="pp-img">
          <div className="pp-img-bg" style={{ backgroundImage: bgImage, backgroundPosition: product.imagePos }} />
          <Link href="/marketplace" className="pp-img-back">La Collection</Link>
          <div className="pp-img-ref">{product.ref} · {product.category}</div>
        </div>

        {/* ── Infos ── */}
        <div className="pp-info">

          <div className="pp-cat">{product.category}</div>
          <h1 className="pp-name">{product.name}</h1>

          {product.description && (
            <p className="pp-desc">{product.description}</p>
          )}

          {/* Couleurs */}
          {hasColors && (
            <div style={{ marginBottom: 40 }}>
              <div className="pp-section-label">
                Coloris — <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", letterSpacing: 0, textTransform: "none", opacity: 1, fontSize: 15 }}>{product.colors[activeColor].label}</em>
              </div>
              <div className="pp-colors">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setActiveColor(i)}
                    title={c.label}
                    className={`pp-swatch${activeColor === i ? " active" : ""}`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tailles */}
          {hasSizes && (
            <div style={{ marginBottom: 40 }}>
              <div className="pp-section-label">
                Pointure
                {!activeSize && <span style={{ color: "rgba(200,80,60,0.7)", letterSpacing: "0.12em", marginLeft: 12 }}>— sélectionner</span>}
              </div>
              <div className="pp-sizes">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setActiveSize(s)} className={`pp-size${activeSize === s ? " active" : ""}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Détails */}
          {product.details.length > 0 && (
            <div className="pp-details">
              <div className="pp-section-label">Composition & détails</div>
              {product.details.map((d) => (
                <div key={d} className="pp-detail-item">
                  <span className="pp-detail-dash">—</span>
                  <span className="pp-detail-text">{d}</span>
                </div>
              ))}
            </div>
          )}

          {/* Prix + CTA */}
          <div className="pp-buy">
            <div className="pp-price">{fmt(product.price)}</div>
            <div className={`pp-stock${outOfStock ? " out" : " in"}`}>
              {outOfStock ? "Rupture de stock" : `${product.stock} pièce${product.stock > 1 ? "s" : ""} disponible${product.stock > 1 ? "s" : ""}`}
            </div>
            <div className="pp-ctas">
              <button onClick={handleCommander} disabled={outOfStock} className="pp-btn-main">
                Commander →
              </button>
              <button onClick={handleAdd} disabled={outOfStock} className={`pp-btn-add${added ? " added" : ""}`}>
                {added ? "Ajouté ✓" : "+ Panier"}
              </button>
            </div>
            <div className="pp-livraison">
              Livraison Abidjan 1–2 jours<br />
              International 5–10 jours · Suivi inclus
            </div>
          </div>

        </div>
      </div>

      {/* ── Autres pièces ── */}
      {related.length > 0 && (
        <div className="pp-related">
          <div className="pp-related-head">Autres pièces</div>
          <div className="pp-related-grid">
            {related.map((p) => (
              <Link key={p.slug} href={`/marketplace/${p.slug}`} className="pp-related-item">
                <div
                  className="pp-related-img"
                  style={{ backgroundImage: p.imageUrl ? `url('${p.imageUrl}')` : `url('/assets/${p.texKey}.png')`, backgroundPosition: p.imagePos }}
                />
                <div className="pp-related-name">{p.name}</div>
                <div className="pp-related-price">{fmt(p.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
