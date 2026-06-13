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
    <section id="marketplace" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <style>{`
        .mp-header { max-width: 1440px; margin: 0 auto; padding: 0 60px 72px; display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; border-bottom: 1px solid var(--hairline); }
        .mp-title { font-family: var(--serif); font-weight: 300; font-size: clamp(48px, 7vw, 96px); line-height: 0.92; letter-spacing: -0.02em; }
        .mp-title em { font-style: italic; }
        .mp-filters { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; padding-bottom: 6px; }
        .mp-filter { font-family: var(--mono); font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; padding: 8px 16px; border: 1px solid var(--hairline); background: transparent; color: var(--fg); cursor: pointer; transition: all 250ms ease; }
        .mp-filter:hover { border-color: var(--fg); }
        .mp-filter.active { background: var(--fg); color: var(--bg); border-color: var(--fg); }
        .mp-count { font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; opacity: 0.4; margin-top: 20px; }

        .mp-list { max-width: 1440px; margin: 0 auto; padding: 0 60px; }
        .mp-item { display: grid; grid-template-columns: 58fr 42fr; min-height: 88vh; border-bottom: 1px solid var(--hairline); overflow: hidden; }
        .mp-item.reverse { grid-template-columns: 42fr 58fr; }
        .mp-item.reverse .mp-img { order: 2; }
        .mp-item.reverse .mp-info { order: 1; }

        .mp-img { position: relative; overflow: hidden; }
        .mp-img-inner { width: 100%; height: 100%; min-height: 600px; background-size: cover; background-position: center; transition: transform 800ms cubic-bezier(.2,.8,.2,1); }
        .mp-item:hover .mp-img-inner { transform: scale(1.035); }
        .mp-img-tag { position: absolute; top: 32px; left: 32px; font-family: var(--mono); font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; padding: 6px 12px; background: var(--panel); color: var(--panel-fg); }
        .mp-img-num { position: absolute; bottom: 32px; right: 32px; font-family: var(--serif); font-style: italic; font-size: 13px; letter-spacing: 0.1em; color: var(--panel-fg); opacity: 0.7; }

        .mp-info { padding: 64px 56px; display: flex; flex-direction: column; justify-content: center; gap: 0; }
        .mp-item.reverse .mp-info { padding: 64px 64px 64px 48px; }

        .mp-ref { font-family: var(--mono); font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; opacity: 0.45; margin-bottom: 20px; }
        .mp-name { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: clamp(36px, 4vw, 58px); line-height: 1.0; letter-spacing: -0.01em; margin-bottom: 24px; }
        .mp-desc { font-family: var(--serif); font-size: 18px; font-weight: 400; line-height: 1.7; opacity: 0.75; margin-bottom: 40px; max-width: 38ch; }

        .mp-colors { display: flex; gap: 8px; margin-bottom: 40px; }
        .mp-color { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; outline: 2px solid transparent; outline-offset: 2px; transition: outline 200ms; }
        .mp-color:hover { outline-color: var(--fg); }

        .mp-price { font-family: var(--serif); font-style: italic; font-size: clamp(28px, 3vw, 42px); letter-spacing: -0.01em; margin-bottom: 36px; }

        .mp-actions { display: flex; gap: 12px; align-items: center; }
        .mp-btn-primary { padding: 15px 32px; background: var(--fg); color: var(--bg); font-family: var(--mono); font-size: 9px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: opacity 250ms; }
        .mp-btn-primary:hover { opacity: 0.82; }
        .mp-btn-primary.added { opacity: 0.45; }
        .mp-btn-ghost { padding: 15px 24px; background: transparent; color: var(--fg); font-family: var(--mono); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; border: 1px solid var(--hairline); cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: border-color 250ms; }
        .mp-btn-ghost:hover { border-color: var(--fg); }

        .mp-rupture { font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(200,80,60,0.8); margin-bottom: 16px; }

        @media (max-width: 1024px) {
          .mp-header { padding: 0 32px 52px; }
          .mp-list { padding: 0 32px; }
          .mp-item, .mp-item.reverse { grid-template-columns: 1fr; min-height: auto; }
          .mp-item.reverse .mp-img { order: 1; }
          .mp-item.reverse .mp-info { order: 2; }
          .mp-img-inner { min-height: 70vw; }
          .mp-info, .mp-item.reverse .mp-info { padding: 40px 32px 56px; }
        }
        @media (max-width: 600px) {
          .mp-header { padding: 0 20px 40px; flex-direction: column; align-items: flex-start; gap: 28px; }
          .mp-list { padding: 0 20px; }
          .mp-info, .mp-item.reverse .mp-info { padding: 32px 20px 48px; }
          .mp-filters { justify-content: flex-start; }
        }
      `}</style>

      {/* Header */}
      <div className="mp-header">
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 16 }}>
            / 02 — La Collection
          </div>
          <h1 className="mp-title">La <em>Collection</em></h1>
          <div className="mp-count">{visible.length} pièce{visible.length > 1 ? "s" : ""} · Édition courante</div>
        </div>
        <div>
          <div className="mp-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`mp-filter${filter === cat ? " active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste éditoriale */}
      <div className="mp-list">
        {visible.map((p: Product, i) => (
          <article key={p.ref} className={`mp-item${i % 2 === 1 ? " reverse" : ""}`}>

            {/* Image */}
            <div className="mp-img">
              <Link href={`/marketplace/${p.slug}`} style={{ display: "block", height: "100%" }}>
                <div
                  className="mp-img-inner"
                  style={{
                    backgroundImage: p.imageUrl
                      ? `url('${p.imageUrl}')`
                      : `url('/assets/${p.texKey}.png')`,
                    backgroundPosition: p.imagePos,
                  }}
                />
              </Link>
              <span className="mp-img-tag">{p.category}</span>
              <span className="mp-img-num">0{i + 1} / 0{visible.length}</span>
            </div>

            {/* Infos */}
            <div className="mp-info">
              <div className="mp-ref">{p.ref}</div>
              <h2 className="mp-name">{p.name}</h2>

              {p.description ? (
                <p className="mp-desc">{p.description}</p>
              ) : (
                <p className="mp-desc">Pièce artisanale en cuir pleine fleur, façonnée à Abidjan.</p>
              )}

              {p.colors.length > 0 && (
                <div className="mp-colors">
                  {p.colors.map((c) => (
                    <div
                      key={c.name}
                      className="mp-color"
                      title={c.label}
                      style={{ background: c.hex, borderColor: "var(--hairline)" }}
                    />
                  ))}
                </div>
              )}

              <div className="mp-price">{fmt(p.price)}</div>

              {p.stock === 0 && <div className="mp-rupture">Rupture de stock</div>}

              <div className="mp-actions">
                <button
                  className={`mp-btn-primary${added[p.ref] ? " added" : ""}`}
                  onClick={(e) => handleAdd(e, p.ref)}
                  disabled={p.stock === 0}
                >
                  <span>{added[p.ref] ? "Ajouté ✓" : "Ajouter au panier"}</span>
                </button>
                <Link href={`/marketplace/${p.slug}`} className="mp-btn-ghost">
                  Voir la pièce
                </Link>
              </div>
            </div>

          </article>
        ))}
      </div>

    </section>
  );
}
