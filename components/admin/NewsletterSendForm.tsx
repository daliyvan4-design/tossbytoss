"use client";

import { useState } from "react";

export function NewsletterSendForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; count?: number; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setResult(data);
    setSending(false);
  }

  const INPUT_STYLE = {
    background: "transparent",
    border: "1px solid rgba(245,242,236,0.18)",
    padding: "10px 14px",
    fontFamily: "var(--font-cormorant, Georgia, serif)",
    fontSize: 17,
    color: "inherit",
    outline: "none",
    width: "100%",
  };

  const LABEL_STYLE = {
    fontFamily: "var(--font-jetbrains, monospace)",
    fontSize: 9,
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    opacity: 0.55,
  };

  return (
    <div style={{ border: "1px solid rgba(245,242,236,0.10)", padding: 28 }}>
      <div style={{ ...LABEL_STYLE, marginBottom: 20 }}>Envoyer une campagne</div>
      <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={LABEL_STYLE}>Objet</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={INPUT_STYLE}
            placeholder="Nouvelle collection…"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={LABEL_STYLE}>Corps (HTML autorisé)</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }}
            placeholder="<p>Bonjour,</p>…"
          />
        </div>
        <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, letterSpacing: "0.12em" }}>
          Utilisez {"{{UNSUB_URL}}"} pour le lien de désabonnement.
        </div>
        {result?.ok && (
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(100,190,100,0.9)" }}>
            {result.count} email{(result.count ?? 0) > 1 ? "s" : ""} envoyé{(result.count ?? 0) > 1 ? "s" : ""}.
          </div>
        )}
        {result?.error && (
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)" }}>
            {result.error}
          </div>
        )}
        <button
          type="submit"
          disabled={sending}
          style={{ padding: "12px 24px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: sending ? 0.5 : 1 }}
        >
          {sending ? "Envoi…" : "Envoyer à tous les abonnés"}
        </button>
      </form>
    </div>
  );
}
