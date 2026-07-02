"use client";

import { useState } from "react";

const FONT = "var(--font-montserrat, sans-serif)";

const INPUT = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid rgba(17,17,17,0.18)",
  borderRadius: 6,
  padding: "13px 16px",
  fontFamily: FONT,
  fontSize: 15,
  color: "#111111",
  outline: "none",
  boxSizing: "border-box" as const,
};

export function NewsletterSendForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; count?: number; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Envoyer « ${subject} » à tous les abonnés ?`)) return;
    setSending(true);
    setResult(null);

    // Texte simple → paragraphes HTML
    const body = message
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 18px;line-height:1.7;">${p.trim().replace(/\n/g, "<br/>")}</p>`)
      .join("");

    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setResult(data);
    if (data.ok) { setSubject(""); setMessage(""); }
    setSending(false);
  }

  return (
    <div style={{ border: "1px solid rgba(17,17,17,0.12)", borderRadius: 10, padding: 28, background: "#ffffff" }}>
      <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 6 }}>
        Envoyer un message
      </div>
      <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(17,17,17,0.55)", marginBottom: 24, lineHeight: 1.6 }}>
        Écrivez simplement votre message — la mise en page est automatique.
      </p>

      <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#111111", display: "block", marginBottom: 8 }}>
            Objet
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={INPUT}
            placeholder="Nouvelle collection disponible"
          />
        </div>

        <div>
          <label style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#111111", display: "block", marginBottom: 8 }}>
            Message
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={9}
            style={{ ...INPUT, resize: "vertical", lineHeight: 1.7 }}
            placeholder={"Bonjour,\n\nNotre nouvelle collection est arrivée à l'atelier…"}
          />
        </div>

        {result?.ok && (
          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#1d7a3e" }}>
            ✓ Envoyé à {result.count} abonné{(result.count ?? 0) > 1 ? "s" : ""}.
          </div>
        )}
        {result?.error && (
          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#c03a2b" }}>
            {result.error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !subject || !message}
          style={{
            padding: "14px 24px",
            background: "#111111",
            color: "#ffffff",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 6,
            cursor: sending || !subject || !message ? "default" : "pointer",
            opacity: sending || !subject || !message ? 0.4 : 1,
          }}
        >
          {sending ? "Envoi en cours…" : "Envoyer à tous les abonnés"}
        </button>
      </form>
    </div>
  );
}
