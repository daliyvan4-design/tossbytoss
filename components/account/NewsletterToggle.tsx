"use client";

import { useState } from "react";

export function NewsletterToggle({ initialActive }: { initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !active;
    setActive(next);        // optimiste
    setBusy(true);
    try {
      const res = await fetch("/api/account/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) setActive(!next); // rollback si échec
    } catch {
      setActive(!next);
    }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, border: "1px solid var(--hairline)", padding: "20px 24px" }}>
      <div>
        <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 19 }}>Newsletter</div>
        <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 12, opacity: 0.5, marginTop: 4 }}>
          {active ? "Vous recevez nos nouveautés et éditions limitées." : "Vous ne recevez aucun email marketing."}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        role="switch"
        aria-checked={active}
        aria-label="Activer ou désactiver la newsletter"
        style={{
          width: 52, height: 30, borderRadius: 999, flexShrink: 0,
          border: "1px solid var(--hairline)",
          background: active ? "var(--fg)" : "transparent",
          position: "relative", cursor: busy ? "default" : "pointer",
          transition: "background 250ms", padding: 0, opacity: busy ? 0.6 : 1,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: active ? 25 : 3,
          width: 22, height: 22, borderRadius: "50%",
          background: active ? "var(--bg)" : "var(--fg)",
          transition: "left 250ms, background 250ms",
        }} />
      </button>
    </div>
  );
}
