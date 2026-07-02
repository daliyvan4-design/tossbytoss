"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "PENDING",   label: "En attente" },
  { value: "PAID",      label: "Payée" },
  { value: "SHIPPED",   label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

const INPUT = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(245,242,236,0.18)",
  padding: "10px 14px",
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 10,
  color: "inherit",
  marginBottom: 14,
  outline: "none",
} as const;

const LABEL = {
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 9,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  opacity: 0.45,
  marginBottom: 8,
  display: "block",
};

export function StatusForm({
  orderRef,
  currentStatus,
  currentTracking,
}: {
  orderRef: string;
  currentStatus: string;
  currentTracking?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus]     = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const needsTracking = status === "SHIPPED" || status === "DELIVERED";
  const unchanged = status === currentStatus && tracking === (currentTracking ?? "");

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/commandes/${orderRef}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking || null }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
    setSaving(false);
  }

  return (
    <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
        Statut & Suivi
      </div>

      <label style={LABEL}>Statut</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ ...INPUT, marginBottom: 20 }}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value} style={{ background: "#0a0a0a" }}>
            {s.label}
          </option>
        ))}
      </select>

      {needsTracking && (
        <>
          <label style={LABEL}>N° de suivi</label>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Ex: DHL-1234567890"
            style={INPUT}
          />
        </>
      )}

      <button
        onClick={handleSave}
        disabled={saving || unchanged}
        style={{
          width: "100%",
          padding: "10px",
          background: saved ? "rgba(80,160,100,0.85)" : "rgba(245,242,236,0.9)",
          color: "#0a0a0a",
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          border: "none",
          cursor: saving || unchanged ? "default" : "pointer",
          opacity: saving || unchanged ? 0.4 : 1,
          transition: "background 300ms",
        }}
      >
        {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé" : "Mettre à jour"}
      </button>
    </div>
  );
}
