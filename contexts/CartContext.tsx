"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PRODUCTS, fmt, type Product } from "@/lib/products";

export interface LiveProduct extends Product {
  stock: number;
  active: boolean;
}

interface LiveData {
  ref: string;
  price: number;
  stock: number;
  active: boolean;
}

interface CartContextValue {
  cart: Map<number, number>;
  drawerOpen: boolean;
  totalCount: number;
  totalPrice: number;
  addToCart: (idx: number) => void;
  updateQty: (idx: number, delta: number) => void;
  removeFromCart: (idx: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  fmt: (n: number) => string;
  products: LiveProduct[];
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveMap, setLiveMap] = useState<Record<string, LiveData>>({});

  useEffect(() => {
    // Try Redis first (cross-device), fall back to localStorage
    fetch("/api/cart")
      .then((r) => r.json())
      .then(({ cart: entries }: { cart: [number, number][] }) => {
        if (entries?.length) {
          setCart(new Map(entries));
          localStorage.setItem("tbt-cart", JSON.stringify(entries));
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

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: LiveData[]) => {
        setLiveMap(Object.fromEntries(data.map((d) => [d.ref, d])));
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((c: Map<number, number>) => {
    const entries = [...c.entries()];
    localStorage.setItem("tbt-cart", JSON.stringify(entries));
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: entries }),
    }).catch(() => null);
  }, []);

  const addToCart = useCallback((idx: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(idx, (next.get(idx) ?? 0) + 1);
      persist(next);
      return next;
    });
  }, [persist]);

  const updateQty = useCallback((idx: number, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const q = (next.get(idx) ?? 0) + delta;
      if (q <= 0) next.delete(idx); else next.set(idx, q);
      persist(next);
      return next;
    });
  }, [persist]);

  const removeFromCart = useCallback((idx: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(idx);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearCart = useCallback(() => {
    const empty = new Map<number, number>();
    setCart(empty);
    persist(empty);
  }, [persist]);

  const products: LiveProduct[] = PRODUCTS
    .filter((p) => liveMap[p.ref]?.active !== false)
    .map((p) => ({
      ...p,
      price: liveMap[p.ref]?.price ?? p.price,
      stock: liveMap[p.ref]?.stock ?? 99,
      active: liveMap[p.ref]?.active ?? true,
    }));

  const totalCount = [...cart.values()].reduce((a, b) => a + b, 0);
  const totalPrice = [...cart.entries()].reduce((sum, [i, q]) => {
    const p = products.find((x) => x.id === i);
    return sum + (p?.price ?? 0) * q;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, drawerOpen, totalCount, totalPrice,
      addToCart, updateQty, removeFromCart, clearCart,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      fmt, products,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
