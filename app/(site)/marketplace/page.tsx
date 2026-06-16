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
    setTimeout(() => setAdded((prev) => ({ ...prev, [ref]: false })), 2000);
  }

  const visible = filter === "Tout" ? products : products.filter((p) => p.category === filter);

  return (
    <>
      <style>{`

        /* ── En-tête ── */
        .roi-head {
          max-width: 1440px; margin: 0 auto;
          padding: 0 80px 80px;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 48px; border-bottom: 1px solid var(--hairline);
        }
        .roi-head-left { flex: 1; }
        .roi-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.42em;
          text-transform: uppercase; opacity: 0.38; margin-bottom: 28px;
          display: flex; align-items: center; gap: 16px;
        }
        .roi-eyebrow::before { content: ""; display: block; width: 32px; height: 1px; background: currentColor; opacity: 0.5; }
        .roi-title {
          font-family: var(--serif); font-weight: 300;
          font-size: clamp(56px, 8vw, 120px);
          line-height: 0.9; letter-spacing: -0.025em;
        }
        .roi-title em { font-style: italic; }
        .roi-manifeste {
          margin-top: 36px;
          font-family: var(--serif); font-style: italic;
          font-size: 18px; line-height: 1.75; opacity: 0.55; max-width: 36ch;
        }
        .roi-filters {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 4px; padding-bottom: 8px;
        }
        .roi-filters-label {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em;
          text-transform: uppercase; opacity: 0.3; margin-bottom: 10px;
          text-align: right;
        }
        .roi-f {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; padding: 7px 18px;
          border: 1px solid transparent; background: transparent;
          color: var(--fg); cursor: pointer; transition: all 220ms ease;
          text-align: right;
        }
        .roi-f:hover { border-color: var(--hairline); }
        .roi-f.active {
          border-color: var(--fg);
          background: var(--fg); color: var(--bg);
        }

        /* ── Item produit ── */
        .roi-item {
          display: grid;
          grid-template-columns: 38fr 62fr;
          min-height: 92vh;
          border-bottom: 1px solid var(--hairline);
          max-width: 100%;
          overflow: hidden;
        }
        .roi-item.flip { grid-template-columns: 62fr 38fr; }
        .roi-item.flip .roi-img  { order: 1; }
        .roi-item.flip .roi-info { order: 2; }

        /* ── Image ── */
        .roi-img {
          position: relative; overflow: hidden;
          background: var(--hairline);
        }
        .roi-img-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 1400ms cubic-bezier(.16,1,.3,1);
          will-change: transform;
        }
        .roi-item:hover .roi-img-bg { transform: scale(1.06); }

        /* gradient latéral pour fondre sur l'info */
        .roi-img-fade {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
        }
        .roi-item:not(.flip) .roi-img-fade {
          background: linear-gradient(to left, transparent 60%, var(--bg) 100%);
        }
        .roi-item.flip .roi-img-fade {
          background: linear-gradient(to right, transparent 60%, var(--bg) 100%);
        }

        .roi-img-stamp {
          position: absolute; bottom: 40px; z-index: 2;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em;
          text-transform: uppercase; opacity: 0.45;
          writing-mode: vertical-rl;
        }
        .roi-item:not(.flip) .roi-img-stamp { right: 32px; }
        .roi-item.flip .roi-img-stamp { left: 32px; transform: rotate(180deg); }

        /* ── Infos ── */
        .roi-info {
          padding: 80px 64px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative; z-index: 2;
        }

        .roi-num {
          font-family: var(--serif); font-style: italic;
          font-size: 11px; letter-spacing: 0.2em; opacity: 0.28;
          margin-bottom: 36px; display: flex; align-items: center; gap: 14px;
        }
        .roi-num::after { content: ""; flex: 1; max-width: 48px; height: 1px; background: currentColor; opacity: 0.4; }

        .roi-cat {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.42em;
          text-transform: uppercase; opacity: 0.38; margin-bottom: 18px;
        }

        .roi-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: clamp(44px, 5.5vw, 80px);
          line-height: 0.93; letter-spacing: -0.02em;
          margin-bottom: 36px;
        }

        .roi-desc {
          font-family: var(--serif); font-size: 17px; line-height: 1.82;
          opacity: 0.6; max-width: 32ch; margin-bottom: 44px;
          font-weight: 400;
        }

        .roi-matiere {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em;
          text-transform: uppercase; opacity: 0.4; margin-bottom: 28px;
        }
        .roi-matiere::before { content: ""; width: 20px; height: 1px; background: currentColor; }

        .roi-colors { display: flex; gap: 12px; margin-bottom: 48px; align-items: center; }
        .roi-color-wrap { display: flex; align-items: center; gap: 8px; }
        .roi-swatch {
          width: 18px; height: 18px; border-radius: 50%;
          box-shadow: 0 0 0 1px var(--hairline), 0 0 0 3px transparent;
          transition: box-shadow 200ms;
          cursor: default;
        }
        .roi-swatch:hover { box-shadow: 0 0 0 1px var(--fg), 0 0 0 3px var(--bg), 0 0 0 4px var(--fg); }
        .roi-color-label {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em;
          text-transform: uppercase; opacity: 0.35;
        }

        .roi-hr { width: 100%; height: 1px; background: var(--hairline); margin-bottom: 40px; }

        .roi-price-row { display: flex; align-items: baseline; gap: 24px; margin-bottom: 48px; }
        .roi-price {
          font-family: var(--serif); font-style: italic;
          font-size: clamp(30px, 3.2vw, 46px); letter-spacing: -0.01em;
        }
        .roi-stock {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.25em;
          text-transform: uppercase;
        }
        .roi-stock.out { color: rgba(200,80,60,0.75); }
        .roi-stock.in { color: rgba(80,160,100,0.7); }

        .roi-ctas { display: flex; align-items: center; gap: 14px; }
        .roi-btn-add {
          padding: 15px 40px;
          background: var(--fg); color: var(--bg);
          font-family: var(--mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: opacity 300ms ease;
        }
        .roi-btn-add:hover { opacity: 0.78; }
        .roi-btn-add:disabled { opacity: 0.25; cursor: default; }
        .roi-btn-add.added { opacity: 0.38; }
        .roi-btn-see {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--fg); text-decoration: none;
          opacity: 0.5; transition: opacity 220ms;
          display: inline-flex; align-items: center; gap: 8px;
          border-bottom: 1px solid var(--hairline); padding-bottom: 2px;
        }
        .roi-btn-see:hover { opacity: 1; border-bottom-color: var(--fg); }

        @media (max-width: 1080px) {
          .roi-head { padding: 0 40px 60px; }
          .roi-item, .roi-item.flip { grid-template-columns: 1fr; min-height: auto; }
          .roi-item .roi-img  { order: 1; min-height: 70vw; }
          .roi-item .roi-info { order: 2; }
          .roi-item.flip .roi-img  { order: 1; min-height: 70vw; }
          .roi-item.flip .roi-info { order: 2; }
          .roi-img-bg { position: relative; min-height: 70vw; }
          .roi-img-fade { display: none; }
          .roi-info { padding: 48px 40px 64px; }
        }
        @media (max-width: 600px) {
          .roi-head { padding: 0 24px 48px; flex-direction: column; align-items: flex-start; }
          .roi-filters { align-items: flex-start; }
          .roi-f { text-align: left; }
          .roi-info { padding: 36px 24px 52px; }
        }
      `}</style>

      <div style={{ paddingTop: 148 }}>

        {/* ── En-tête ── */}
        <div className="roi-head">
          <div className="roi-head-left">
            <div className="roi-eyebrow">La Collection · Édition courante</div>
            <h1 className="roi-title">Maroquinerie<br /><em>d'Auteur</em></h1>
            <p className="roi-manifeste">
              Chaque pièce naît des mains d'un artisan à Abidjan.<br />
              Cuir pleine fleur, finitions à la main, numérotée.
            </p>
          </div>
          <div>
            <div className="roi-filters-label">Filtrer par</div>
            <div className="roi-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`roi-f${filter === cat ? " active" : ""}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Produits ── */}
        {visible.map((p: Product, i) => (
          <div key={p.ref} className={`roi-item${i % 2 === 1 ? " flip" : ""}`}>

            {/* Image */}
            <div className="roi-img">
              <Link href={`/marketplace/${p.slug}`} style={{ position: "absolute", inset: 0, display: "block", zIndex: 1 }} tabIndex={-1} aria-hidden>
                <div
                  className="roi-img-bg"
                  style={{
                    backgroundImage: p.imageUrl
                      ? `url('${p.imageUrl}')`
                      : `url('/assets/${p.texKey}.png')`,
                    backgroundPosition: p.imagePos,
                  }}
                />
              </Link>
              <div className="roi-img-fade" />
              <div className="roi-img-stamp">{p.ref} · {p.category}</div>
            </div>

            {/* Infos */}
            <div className="roi-info">
              <div className="roi-num">
                {String(i + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
              </div>

              <div className="roi-cat">{p.category}</div>
              <h2 className="roi-name">{p.name}</h2>

              <p className="roi-desc">
                {p.description || "Pièce artisanale en cuir pleine fleur, façonnée à Abidjan. Chaque pièce porte l'empreinte unique de la main qui l'a créée."}
              </p>

              <div className="roi-matiere">Cuir pleine fleur · Fait à Abidjan</div>

              {p.colors.length > 0 && (
                <div className="roi-colors">
                  {p.colors.map((c, ci) => (
                    <div key={c.name} className="roi-color-wrap">
                      <div
                        className="roi-swatch"
                        title={c.label}
                        style={{ background: c.hex }}
                      />
                      {ci === 0 && <span className="roi-color-label">{p.colors.length} coloris</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="roi-hr" />

              <div className="roi-price-row">
                <div className="roi-price">{fmt(p.price)}</div>
                {p.stock === 0
                  ? <div className="roi-stock out">Rupture</div>
                  : <div className="roi-stock in">{p.stock} en stock</div>
                }
              </div>

              <div className="roi-ctas">
                <button
                  className={`roi-btn-add${added[p.ref] ? " added" : ""}`}
                  onClick={(e) => handleAdd(e, p.ref)}
                  disabled={p.stock === 0}
                >
                  {added[p.ref] ? "Ajouté ✓" : "Ajouter au panier"}
                </button>
                <Link href={`/marketplace/${p.slug}`} className="roi-btn-see">
                  Voir la pièce <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16 }}>→</span>
                </Link>
              </div>
            </div>

          </div>
        ))}

      </div>
    </>
  );
}
