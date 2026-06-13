"use client";

import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, totalPrice, updateQty, removeFromCart, fmt, products } = useCart();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const items = [...cart.entries()]
    .map(([ref, qty]) => ({ ref, qty, product: products.find((p) => p.ref === ref) }))
    .filter((x) => x.product !== undefined) as { ref: string; qty: number; product: NonNullable<ReturnType<typeof products.find>> }[];

  const hasItems = items.length > 0;

  return (
    <>
      <div className={`cart-overlay${drawerOpen ? " open" : ""}`} onClick={closeDrawer} />
      <aside className={`drawer${drawerOpen ? " open" : ""}`} aria-label="Panier">
        <div className="drawer-head">
          <h3>Votre <em>panier</em></h3>
          <button className="drawer-close" onClick={closeDrawer}>Fermer ✕</button>
        </div>
        <div className="drawer-body">
          {!hasItems && (
            <div className="drawer-empty">— Votre panier est vide —</div>
          )}
          {items.map(({ ref, qty, product: p }) => (
            <div className="drawer-item" key={ref}>
              <div className="thumb" style={{
                backgroundImage: p.imageUrl
                  ? `url('${p.imageUrl}')`
                  : `url('/assets/${p.texKey}.png')`,
                backgroundPosition: p.imagePos,
              }} />
              <div className="info">
                <div className="name">{p.name}</div>
                <div className="ref">{p.ref} · {p.category}</div>
                <div className="qty">
                  <button onClick={() => updateQty(ref, -1)} aria-label="Réduire">−</button>
                  <span className="n">{qty}</span>
                  <button onClick={() => updateQty(ref, 1)} aria-label="Augmenter">+</button>
                </div>
              </div>
              <div>
                <div className="price">{fmt(p.price * qty)}</div>
                <button className="remove" onClick={() => removeFromCart(ref)}>Retirer</button>
              </div>
            </div>
          ))}
        </div>
        {hasItems && (
          <div className="drawer-foot">
            <div className="drawer-total">
              <span className="lbl">Sous-total</span>
              <span className="val">{fmt(totalPrice)}</span>
            </div>
            <button className="drawer-cta" onClick={() => { closeDrawer(); router.push("/checkout"); }}>
              <span>Passer commande</span><span>→</span>
            </button>
            <div className="drawer-fineprint">Livraison Abidjan offerte · International sur devis</div>
          </div>
        )}
      </aside>
    </>
  );
}
