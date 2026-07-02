"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "transparent",
        border: "none",
        color: "#111111",
        fontFamily: "var(--font-montserrat, sans-serif)",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity: 0.35,
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
      }}
    >
      Déconnexion
    </button>
  );
}
