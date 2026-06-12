"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import Link from "next/link";

export default function MarketplacePage() {
  const { addToCart, fmt, products } = useCart();
  const [added, setAdded] = useState<Record<number, boolean>>({});

  function handleAdd(e: React.MouseEvent, i: number) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(i);
    setAdded((prev) => ({ ...prev, [i]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [i]: false })), 1800);
  }

  return (
    <section id="marketplace" style={{ paddingTop: 180 }}>
      <div className="section-head">
        <div className="num-large">/ 02 — Marketplace</div>
        <h2>La <em>Collection</em></h2>
        <div className="right">Six pièces · Édition courante</div>
      </div>
      <div className="market-grid">
        {products.map((p, i) => (
          <Link href={`/marketplace/${p.slug}`} key={p.ref} style={{ textDecoration: "none", color: "inherit" }}>
            <article className="card">
              <div
                className="card-img"
                style={{
                  ["--card-tex" as string]: `url('/assets/${p.tex}.png')`,
                  ["--card-pos" as string]: p.pos,
                }}
              >
                <span className="tag">{p.cat}</span>
                <span className="ref">{p.ref}</span>
                {p.stock === 0 && (
                  <span style={{ position: "absolute", bottom: 12, left: 12, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 10px", background: "rgba(10,10,10,0.75)", color: "rgba(245,100,100,0.9)" }}>
                    Rupture
                  </span>
                )}
              </div>
              <div className="card-body">
                <div className="card-row">
                  <div>
                    <div className="card-name">{p.name}</div>
                    <div className="card-meta">Pièce unique · Cuir pleine fleur</div>
                  </div>
                </div>
                <div className="card-row">
                  <div className="card-price">{fmt(p.price)}</div>
                  <div className="card-meta">Livraison 5–7 jours</div>
                </div>
                <button
                  className={`card-add${added[i] ? " added" : ""}`}
                  onClick={(e) => handleAdd(e, i)}
                >
                  <span>{added[i] ? "Ajouté ✓" : "Ajouter"}</span>
                </button>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
