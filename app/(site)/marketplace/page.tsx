"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

const CATEGORIES = ["Tout", "Sac", "Ceinture", "Maroquinerie", "Soulier"];

export default function MarketplacePage() {
  const { addToCart, fmt, products } = useCart();
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("Tout");

  function handleAdd(e: React.MouseEvent, ref: string) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(ref);
    setAdded((prev) => ({ ...prev, [ref]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [ref]: false })), 1800);
  }

  const visible = filter === "Tout" ? products : products.filter((p) => p.category === filter);

  return (
    <>
      <style>{`
        .cine-wrap { position: relative; }

        /* ── Barre filtre fixe ── */
        .cine-bar {
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          z-index: 40; display: flex; gap: 4px; align-items: center;
          background: var(--bg); border: 1px solid var(--hairline);
          padding: 6px 10px; transition: background 800ms, border-color 800ms;
        }
        .cine-bar-label { font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.4; margin-right: 8px; }
        .cine-f { font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase; padding: 6px 14px; border: none; background: transparent; color: var(--fg); cursor: pointer; transition: background 200ms, color 200ms; }
        .cine-f:hover { background: var(--hairline); }
        .cine-f.active { background: var(--fg); color: var(--bg); }

        /* ── Section produit ── */
        .cine-section {
          position: relative; min-height: 100vh;
          display: grid; grid-template-columns: 46fr 54fr;
          overflow: hidden; border-bottom: 1px solid var(--hairline);
        }

        /* ── Numéro géant en fond ── */
        .cine-num {
          position: absolute; right: -0.05em; top: 50%;
          transform: translateY(-50%);
          font-family: var(--serif); font-style: italic;
          font-size: clamp(240px, 38vw, 520px);
          line-height: 1; color: var(--fg);
          opacity: 0.04; pointer-events: none; user-select: none;
          z-index: 0; letter-spacing: -0.04em;
        }

        /* ── Panneau gauche infos ── */
        .cine-info {
          position: relative; z-index: 2;
          padding: 120px 56px 80px 72px;
          display: flex; flex-direction: column; justify-content: center;
        }

        .cine-meta {
          display: flex; align-items: center; gap: 16px; margin-bottom: 32px;
        }
        .cine-cat {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.38em;
          text-transform: uppercase; padding: 5px 12px;
          border: 1px solid var(--hairline); opacity: 0.65;
        }
        .cine-ref {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em;
          text-transform: uppercase; opacity: 0.35;
        }

        .cine-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: clamp(52px, 6.5vw, 96px); line-height: 0.95;
          letter-spacing: -0.02em; margin-bottom: 36px;
        }

        .cine-desc {
          font-family: var(--serif); font-size: 19px; font-weight: 400;
          line-height: 1.72; opacity: 0.68; max-width: 34ch; margin-bottom: 40px;
        }

        .cine-colors { display: flex; gap: 10px; margin-bottom: 40px; }
        .cine-swatch {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid transparent; outline: 2px solid transparent;
          outline-offset: 3px; cursor: default;
          transition: outline-color 200ms;
        }
        .cine-swatch:hover { outline-color: var(--fg); }

        .cine-divider { width: 32px; height: 1px; background: var(--fg); opacity: 0.3; margin-bottom: 36px; }

        .cine-price {
          font-family: var(--serif); font-style: italic;
          font-size: clamp(32px, 3.5vw, 52px); letter-spacing: -0.01em;
          margin-bottom: 44px;
        }

        .cine-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .cine-add {
          padding: 16px 36px; background: var(--fg); color: var(--bg);
          font-family: var(--mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: opacity 250ms ease;
        }
        .cine-add:hover { opacity: 0.8; }
        .cine-add:disabled { opacity: 0.3; cursor: default; }
        .cine-add.added { opacity: 0.4; }
        .cine-see {
          padding: 16px 28px; background: transparent; color: var(--fg);
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; border: 1px solid var(--hairline);
          text-decoration: none; display: inline-flex; align-items: center;
          transition: border-color 250ms;
        }
        .cine-see:hover { border-color: var(--fg); }

        .cine-rupture {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(200,80,60,0.8); margin-bottom: 20px;
        }

        /* ── Panneau droit image ── */
        .cine-img {
          position: relative; overflow: hidden;
        }
        .cine-img-inner {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 1200ms cubic-bezier(.2,.8,.2,1);
        }
        .cine-section:hover .cine-img-inner { transform: scale(1.04); }
        .cine-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, var(--bg) 0%, transparent 30%);
          pointer-events: none; z-index: 1;
        }

        /* ── Index produit coin bas droite ── */
        .cine-index {
          position: absolute; bottom: 36px; right: 40px; z-index: 3;
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.22em;
          color: var(--fg); opacity: 0.35; writing-mode: vertical-rl;
          text-transform: uppercase;
        }

        /* ── Header haut de page ── */
        .cine-header {
          min-height: 56vh; display: flex; flex-direction: column;
          justify-content: flex-end; padding: 0 72px 64px;
          border-bottom: 1px solid var(--hairline); position: relative;
          overflow: hidden;
        }
        .cine-header-num {
          position: absolute; right: -0.02em; bottom: -0.18em;
          font-family: var(--serif); font-style: italic;
          font-size: clamp(180px, 30vw, 420px);
          color: var(--fg); opacity: 0.035; pointer-events: none;
          line-height: 1; letter-spacing: -0.04em;
        }
        .cine-header-label {
          font-family: var(--mono); font-size: 10px; letter-spacing: 0.35em;
          text-transform: uppercase; opacity: 0.4; margin-bottom: 20px; z-index: 1;
        }
        .cine-header-title {
          font-family: var(--serif); font-weight: 300; font-style: italic;
          font-size: clamp(60px, 10vw, 140px); line-height: 0.9;
          letter-spacing: -0.03em; z-index: 1;
        }
        .cine-header-sub {
          margin-top: 32px; font-family: var(--mono); font-size: 10px;
          letter-spacing: 0.25em; text-transform: uppercase; opacity: 0.45; z-index: 1;
        }

        @media (max-width: 1024px) {
          .cine-section { grid-template-columns: 1fr; min-height: auto; }
          .cine-img { min-height: 65vw; }
          .cine-img-inner { position: relative; min-height: 65vw; }
          .cine-img-overlay { display: none; }
          .cine-info { padding: 48px 32px 60px; }
          .cine-num { font-size: clamp(160px, 45vw, 300px); }
          .cine-header { padding: 0 32px 48px; min-height: 40vh; }
        }
        @media (max-width: 600px) {
          .cine-info { padding: 40px 20px 52px; }
          .cine-header { padding: 0 20px 40px; }
          .cine-bar { top: 72px; padding: 5px 8px; }
        }
      `}</style>

      <div className="cine-wrap" style={{ paddingTop: 140 }}>

        {/* Filtre flottant */}
        <div className="cine-bar">
          <span className="cine-bar-label">Filtre</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cine-f${filter === cat ? " active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Header éditorial */}
        <div className="cine-header">
          <div className="cine-header-num">02</div>
          <div className="cine-header-label">Toss by Toss · Abidjan</div>
          <h1 className="cine-header-title">La<br /><em>Collection</em></h1>
          <div className="cine-header-sub">{visible.length} pièce{visible.length !== 1 ? "s" : ""} · Édition courante · Cuir pleine fleur</div>
        </div>

        {/* Produits */}
        {visible.map((p: Product, i) => (
          <div key={p.ref} className="cine-section">

            {/* Numéro géant en fond */}
            <div className="cine-num" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </div>

            {/* Infos */}
            <div className="cine-info">
              <div className="cine-meta">
                <span className="cine-cat">{p.category}</span>
                <span className="cine-ref">{p.ref}</span>
              </div>

              <h2 className="cine-name">{p.name}</h2>

              <p className="cine-desc">
                {p.description || "Pièce artisanale en cuir pleine fleur, façonnée à Abidjan. Chaque pièce porte l'empreinte de la main qui l'a créée."}
              </p>

              {p.colors.length > 0 && (
                <div className="cine-colors">
                  {p.colors.map((c) => (
                    <div
                      key={c.name}
                      className="cine-swatch"
                      title={c.label}
                      style={{ background: c.hex, borderColor: "var(--hairline)" }}
                    />
                  ))}
                </div>
              )}

              <div className="cine-divider" />
              <div className="cine-price">{fmt(p.price)}</div>

              {p.stock === 0 && <div className="cine-rupture">Rupture de stock</div>}

              <div className="cine-actions">
                <button
                  className={`cine-add${added[p.ref] ? " added" : ""}`}
                  onClick={(e) => handleAdd(e, p.ref)}
                  disabled={p.stock === 0}
                >
                  {added[p.ref] ? "Ajouté ✓" : "Ajouter au panier"}
                </button>
                <Link href={`/marketplace/${p.slug}`} className="cine-see">
                  Découvrir →
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="cine-img">
              <Link href={`/marketplace/${p.slug}`} style={{ display: "block", height: "100%", position: "absolute", inset: 0 }}>
                <div
                  className="cine-img-inner"
                  style={{
                    backgroundImage: p.imageUrl
                      ? `url('${p.imageUrl}')`
                      : `url('/assets/${p.texKey}.png')`,
                    backgroundPosition: p.imagePos,
                  }}
                />
              </Link>
              <div className="cine-img-overlay" />
              <div className="cine-index">{p.ref} · {p.category}</div>
            </div>

          </div>
        ))}

      </div>
    </>
  );
}
