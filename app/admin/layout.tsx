import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Toss by Toss" };

const NAV = [
  { href: "/admin",              label: "Dashboard",    num: "01" },
  { href: "/admin/produits",     label: "Produits",     num: "02" },
  { href: "/admin/commandes",    label: "Commandes",    num: "03" },
  { href: "/admin/analytiques",  label: "Analytiques",  num: "04" },
  { href: "/admin/comptabilite", label: "Comptabilité", num: "05" },
  { href: "/admin/newsletter",   label: "Newsletter",   num: "06" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#f5f2ec", fontFamily: "var(--font-montserrat, 'Helvetica Neue', sans-serif)" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: "1px solid rgba(245,242,236,0.10)", padding: "40px 0", display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
        <div style={{ padding: "0 32px 40px", borderBottom: "1px solid rgba(245,242,236,0.10)" }}>
          <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22, letterSpacing: "-0.01em" }}>Toss by Toss</div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.45, marginTop: 6 }}>Admin Panel</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 0, padding: "24px 0" }}>
          {NAV.map(({ href, label, num }) => (
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
                borderLeft: "2px solid transparent",
                transition: "border-color 200ms, opacity 200ms",
                opacity: 0.65,
              }}
            >
              <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.5, letterSpacing: "0.22em" }}>{num}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "24px 32px", borderTop: "1px solid rgba(245,242,236,0.10)", display: "flex", flexDirection: "column", gap: 14 }}>
          <Link href="/" style={{ color: "#f5f2ec", textDecoration: "none", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.45 }}>
            ← Retour au site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "48px 56px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
