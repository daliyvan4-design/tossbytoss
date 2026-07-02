import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Toss by Toss" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#ffffff", color: "#111111", fontFamily: "var(--font-montserrat, 'Helvetica Neue', sans-serif)" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "#f7f7f5", borderRight: "1px solid rgba(17,17,17,0.10)", padding: "40px 0", display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
        <div style={{ padding: "0 32px 40px", borderBottom: "1px solid rgba(17,17,17,0.10)" }}>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 22, letterSpacing: "-0.01em" }}>Toss by Toss</div>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.45, marginTop: 6 }}>Admin Panel</div>
        </div>
        <AdminNav />
        <div style={{ marginTop: "auto", padding: "24px 32px", borderTop: "1px solid rgba(17,17,17,0.10)", display: "flex", flexDirection: "column", gap: 14 }}>
          <Link href="/" style={{ color: "#111111", textDecoration: "none", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.45 }}>
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
