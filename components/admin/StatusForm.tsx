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

export function StatusForm({ orderRef, currentStatus }: { orderRef: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/commandes/${orderRef}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setSaving(false);
  }

  return (
    <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 24 }}>
      <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
        Statut
      </div>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ width: "100%", background: "transparent", border: "1px solid rgba(245,242,236,0.18)", padding: "10px 14px", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "inherit", marginBottom: 14 }}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value} style={{ background: "#0a0a0a" }}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        style={{ width: "100%", padding: "10px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: saving || status === currentStatus ? 0.4 : 1 }}
      >
        {saving ? "Enregistrement…" : "Mettre à jour"}
      </button>
    </div>
  );
}
