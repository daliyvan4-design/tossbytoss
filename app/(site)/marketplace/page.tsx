"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

const CATEGORIES = ["Tout", "Sac", "Ceinture", "Maroquinerie", "Soulier", "Chaussure"];

export default function MarketplacePage() {
  const { addToCart, fmt, products } = useCart();
  const [added, setAdded]   = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("Tout");

  function handleAdd(e: React.MouseEvent, ref: string) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(ref);
    setAdded((prev) => ({ ...prev, [ref]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [ref]: false })), 2000);
  }

  const visible = filter === "Tout"
    ? products
    : products.filter((p) => p.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <style>{`
        /* ── En-tête ──────────────────────────────────── */
        .mp-head {
          max-width: 1440px; margin: 0 auto;
          padding: 0 48px 56px;
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 40px;
          border-bottom: 1px solid var(--hairline);
        }
        .mp-eyebrow {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.38em;
          text-transform: uppercase; opacity: 0.38; margin-bottom: 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .mp-eyebrow::before { content:""; width: 28px; height: 1px; background: currentColor; opacity: 0.5; }
        .mp-title {
          font-family: var(--serif); font-weight: 300;
          font-size: clamp(40px, 5.5vw, 80px);
          line-height: 0.93; letter-spacing: -0.02em;
        }
        .mp-title em { font-style: italic; }
        .mp-sub {
          margin-top: 18px; font-family: var(--serif); font-style: italic;
          font-size: 16px; line-height: 1.7; opacity: 0.5; max-width: 36ch;
        }
        .mp-filters {
          display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
        }
        .mp-filters-lbl {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.3em;
          text-transform: uppercase; opacity: 0.3; margin-bottom: 10px;
        }
        .mp-f {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; padding: 6px 16px;
          border: 1px solid transparent; background: transparent;
          color: var(--fg); cursor: pointer; transition: all 200ms;
        }
        .mp-f:hover { border-color: var(--hairline); }
        .mp-f.active { border-color: var(--fg); background: var(--fg); color: var(--bg); }

        /* ── Grille produits ───────────────────────────── */
        .mp-grid {
          max-width: 1440px; margin: 0 auto;
          padding: 56px 48px 120px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px 28px;
        }

        /* ── Carte produit ─────────────────────────────── */
        .mp-card { display: flex; flex-direction: column; text-decoration: none; color: var(--fg); }

        /* Image */
        .mp-card-img {
          position: relative; overflow: hidden;
          aspect-ratio: 3 / 4;
          background: rgba(128,120,110,0.1);
          margin-bottom: 20px;
        }
        .mp-card-img-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 900ms cubic-bezier(.16,1,.3,1);
        }
        .mp-card:hover .mp-card-img-bg { transform: scale(1.05); }

        /* Overlay hover */
        .mp-card-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: rgba(10,10,10,0.32);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 28px;
          opacity: 0; transition: opacity 300ms;
        }
        .mp-card:hover .mp-card-overlay { opacity: 1; }
        .mp-card-see {
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.28em;
          text-transform: uppercase; color: #f5f2ec;
          border-bottom: 1px solid rgba(245,242,236,0.5);
          padding-bottom: 2px;
        }

        /* Badge stock */
        .mp-card-badge {
          position: absolute; top: 14px; left: 14px; z-index: 3;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.22em;
          text-transform: uppercase; padding: 4px 9px;
          background: rgba(200,70,50,0.88); color: #fff;
        }

        /* Ref stamp */
        .mp-card-ref {
          position: absolute; bottom: 14px; right: 14px; z-index: 3;
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.18em;
          text-transform: uppercase; opacity: 0.45; color: #f5f2ec;
        }

        /* Infos sous l'image */
        .mp-card-cat {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.32em;
          text-transform: uppercase; opacity: 0.38; margin-bottom: 8px;
        }
        .mp-card-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: clamp(22px, 2vw, 28px); line-height: 1.0;
          letter-spacing: -0.01em; margin-bottom: 14px;
        }

        /* Swatches */
        .mp-card-swatches { display: flex; gap: 6px; margin-bottom: 16px; align-items: center; }
        .mp-swatch {
          width: 14px; height: 14px; border-radius: 50%;
          border: 1.5px solid rgba(128,120,110,0.25);
          flex-shrink: 0;
        }
        .mp-swatch-more {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.1em;
          opacity: 0.35;
        }

        /* Prix + bouton */
        .mp-card-bottom {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          border-top: 1px solid var(--hairline); padding-top: 14px;
          margin-top: auto;
        }
        .mp-card-price {
          font-family: var(--serif); font-style: italic;
          font-size: clamp(20px, 1.8vw, 26px);
        }
        .mp-card-add {
          font-family: var(--mono); font-size: 8px; letter-spacing: 0.24em;
          text-transform: uppercase; padding: 9px 16px;
          background: var(--fg); color: var(--bg);
          border: none; cursor: pointer;
          transition: opacity 250ms; white-space: nowrap;
          flex-shrink: 0;
        }
        .mp-card-add:hover { opacity: 0.75; }
        .mp-card-add:disabled { opacity: 0.22; cursor: default; }
        .mp-card-add.added { opacity: 0.4; }

        /* Vide */
        .mp-empty {
          grid-column: 1/-1; padding: 120px 0; text-align: center;
          font-family: var(--serif); font-style: italic; font-size: 22px; opacity: 0.35;
        }

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 1100px) {
          .mp-grid { grid-template-columns: repeat(2, 1fr); gap: 32px 20px; padding: 48px 32px 100px; }
          .mp-head { padding: 0 32px 48px; }
        }
        @media (max-width: 700px) {
          .mp-head { flex-direction: column; align-items: flex-start; padding: 0 20px 40px; gap: 28px; }
          .mp-filters { flex-direction: row; flex-wrap: wrap; align-items: flex-start; gap: 6px; }
          .mp-filters-lbl { display: none; }
          .mp-f { padding: 5px 12px; }
          .mp-grid { grid-template-columns: repeat(2, 1fr); gap: 20px 12px; padding: 36px 20px 80px; }
          .mp-card-img { margin-bottom: 12px; }
          .mp-card-name { font-size: 18px; margin-bottom: 10px; }
          .mp-card-add { padding: 8px 10px; font-size: 7px; letter-spacing: 0.18em; }
          .mp-card-overlay { display: none; }
        }
        @media (max-width: 400px) {
          .mp-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ paddingTop: 140 }}>

        {/* ── En-tête ── */}
        <div className="mp-head">
          <div>
            <div className="mp-eyebrow">La Collection · Édition courante</div>
            <h1 className="mp-title">Maroquinerie <em>d'Auteur</em></h1>
            <p className="mp-sub">Chaque pièce naît des mains d'un artisan à Abidjan. Cuir pleine fleur, finitions à la main.</p>
          </div>
          <div>
            <div className="mp-filters-lbl">Filtrer</div>
            <div className="mp-filters">
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`mp-f${filter === cat ? " active" : ""}`} onClick={() => setFilter(cat)}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grille ── */}
        <div className="mp-grid">
          {visible.length === 0 && (
            <div className="mp-empty">Aucun produit dans cette catégorie.</div>
          )}

          {visible.map((p: Product) => (
            <Link key={p.ref} href={`/marketplace/${p.slug}`} className="mp-card">

              {/* Image */}
              <div className="mp-card-img">
                <div
                  className="mp-card-img-bg"
                  style={{
                    backgroundImage: p.imageUrl
                      ? `url('${p.imageUrl}')`
                      : `url('/assets/${p.texKey}.png')`,
                    backgroundPosition: p.imagePos,
                  }}
                />
                <div className="mp-card-overlay">
                  <span className="mp-card-see">Voir la pièce →</span>
                </div>
                {p.stock === 0 && <div className="mp-card-badge">Rupture</div>}
                <div className="mp-card-ref">{p.ref}</div>
              </div>

              {/* Infos */}
              <div className="mp-card-cat">{p.category}</div>
              <div className="mp-card-name">{p.name}</div>

              {p.colors.length > 0 && (
                <div className="mp-card-swatches">
                  {p.colors.slice(0, 5).map((c) => (
                    <div key={c.name} className="mp-swatch" style={{ background: c.hex }} title={c.label} />
                  ))}
                  {p.colors.length > 5 && <span className="mp-swatch-more">+{p.colors.length - 5}</span>}
                </div>
              )}

              <div className="mp-card-bottom">
                <div className="mp-card-price">{fmt(p.price)}</div>
                <button
                  className={`mp-card-add${added[p.ref] ? " added" : ""}`}
                  onClick={(e) => handleAdd(e, p.ref)}
                  disabled={p.stock === 0}
                >
                  {added[p.ref] ? "Ajouté ✓" : "+ Panier"}
                </button>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
