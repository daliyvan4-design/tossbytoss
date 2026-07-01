"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",              label: "Dashboard",    num: "01" },
  { href: "/admin/produits",     label: "Produits",     num: "02" },
  { href: "/admin/commandes",    label: "Commandes",    num: "03" },
  { href: "/admin/analytiques",  label: "Analytiques",  num: "04" },
  { href: "/admin/comptabilite", label: "Comptabilité", num: "05" },
  { href: "/admin/newsletter",   label: "Newsletter",   num: "06" },
  { href: "/admin/moodboard",    label: "Moodboard",    num: "07" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 0, padding: "24px 0" }}>
      {NAV.map(({ href, label, num }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 32px",
              color: "#f5f2ec",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              borderLeft: active ? "2px solid #f5f2ec" : "2px solid transparent",
              opacity: active ? 1 : 0.55,
              background: active ? "rgba(245,242,236,0.04)" : "transparent",
              transition: "border-color 200ms, opacity 200ms, background 200ms",
            }}
          >
            <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: active ? 0.7 : 0.4, letterSpacing: "0.22em", minWidth: 18 }}>{num}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
