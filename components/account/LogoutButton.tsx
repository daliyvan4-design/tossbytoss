"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => { await signOut({ redirect: false }); router.refresh(); }}
      style={{
        padding: "12px 28px",
        background: "transparent",
        border: "1px solid var(--hairline)",
        color: "var(--fg)",
        fontFamily: "var(--font-jetbrains, monospace)",
        fontSize: 9,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      Se déconnecter
    </button>
  );
}
