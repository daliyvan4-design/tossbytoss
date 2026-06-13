"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fmt, type Product } from "@/lib/products";

interface CartContextValue {
  cart: Map<string, number>;
  drawerOpen: boolean;
  totalCount: number;
  totalPrice: number;
  products: Product[];
  addToCart: (ref: string) => void;
  updateQty: (ref: string, delta: number) => void;
  removeFromCart: (ref: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  fmt: (n: number) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from DB
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => {});
  }, []);

  // Restore cart from Redis then localStorage
  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then(({ cart: entries }: { cart: [string, number][] }) => {
        if (entries?.length) {
          setCart(new Map(entries));
        } else {
          try {
            const saved = localStorage.getItem("tbt-cart");
            if (saved) setCart(new Map(JSON.parse(saved)));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("tbt-cart");
          if (saved) setCart(new Map(JSON.parse(saved)));
        } catch {}
      });
  }, []);

  const persist = useCallback((c: Map<string, number>) => {
    const entries = [...c.entries()];
    localStorage.setItem("tbt-cart", JSON.stringify(entries));
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: entries }),
    }).catch(() => null);
  }, []);

  const addToCart = useCallback((ref: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(ref, (next.get(ref) ?? 0) + 1);
      persist(next);
      return next;
    });
  }, [persist]);

  const updateQty = useCallback((ref: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const q = (next.get(ref) ?? 0) + delta;
      if (q <= 0) next.delete(ref); else next.set(ref, q);
      persist(next);
      return next;
    });
  }, [persist]);

  const removeFromCart = useCallback((ref: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(ref);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearCart = useCallback(() => {
    const empty = new Map<string, number>();
    setCart(empty);
    persist(empty);
  }, [persist]);

  const totalCount = [...cart.values()].reduce((a, b) => a + b, 0);
  const totalPrice = [...cart.entries()].reduce((sum, [ref, qty]) => {
    const p = products.find((x) => x.ref === ref);
    return sum + (p?.price ?? 0) * qty;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, drawerOpen, totalCount, totalPrice, products,
      addToCart, updateQty, removeFromCart, clearCart,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      fmt,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
