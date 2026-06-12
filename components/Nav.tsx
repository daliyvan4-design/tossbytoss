"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Nav() {
  const pathname = usePathname();
  const { toggle } = useTheme();
  const { totalCount, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/moodboard",   label: "Moodboard" },
    { href: "/about",       label: "À propos" },
    { href: "/contact",     label: "Contact" },
  ];

  return (
    <>
      <div className="nav-wrap">
        <nav className="nav" id="nav">
          <Link href="/" className="nav-mark" aria-label="Toss by Toss">
            <Image src="/assets/logo-day.png"   alt="Toss by Toss" width={361} height={272} className="logo-day"  priority />
            <Image src="/assets/logo-night.png" alt="Toss by Toss" width={361} height={272} className="logo-night" priority />
          </Link>
          <div className="nav-links">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""}>
                {label}
              </Link>
            ))}
          </div>
          <div className="nav-right">
            <button className="toggle" onClick={toggle} aria-label="Basculer jour / nuit">
              <span className="knob" />
            </button>
            <button className="cart-btn" onClick={openDrawer} aria-label="Panier">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16l-1.5 11.2a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 7z" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
              <span className="count">
                <b>{String(totalCount).padStart(2, "0")}</b>
              </span>
            </button>
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span className={`ham-icon${menuOpen ? " open" : ""}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile full-screen menu */}
      <div
        className={`nav-mobile-menu${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-mobile-inner">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-mobile-link${pathname === href ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
