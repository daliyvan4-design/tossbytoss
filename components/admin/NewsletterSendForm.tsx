"use client";

import { useState } from "react";

export function NewsletterSendForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; count?: number; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Envoyer "${subject}" à tous les abonnés actifs ?`)) return;
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

  const previewHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#f5f2ec;background:#0a0a0a;padding:40px;">
      <div style="border-bottom:1px solid rgba(245,242,236,0.12);padding-bottom:28px;margin-bottom:36px;">
        <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.36em;text-transform:uppercase;">Toss by Toss</p>
      </div>
      ${body || "<p style='opacity:0.35;font-style:italic;'>Le corps du message apparaîtra ici…</p>"}
      <div style="border-top:1px solid rgba(245,242,236,0.1);margin-top:36px;padding-top:24px;">
        <p style="font-family:'Courier New',monospace;font-size:9px;opacity:0.35;letter-spacing:0.12em;text-transform:uppercase;">
          Vous recevez cet email car vous êtes abonné(e) à la newsletter Toss by Toss.<br/>
          <a href="#" style="color:rgba(245,242,236,0.45);">Se désabonner</a>
        </p>
      </div>
    </div>`;

  const INPUT_STYLE = {
    background: "transparent",
    border: "1px solid rgba(245,242,236,0.18)",
    padding: "10px 14px",
    fontFamily: "var(--font-cormorant, Georgia, serif)",
    fontSize: 17,
    color: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
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
      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid rgba(245,242,236,0.1)" }}>
        {(["Rédiger", "Aperçu"] as const).map((tab) => {
          const active = tab === "Rédiger" ? !preview : preview;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setPreview(tab === "Aperçu")}
              style={{
                padding: "8px 20px",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #f5f2ec" : "2px solid transparent",
                color: "#f5f2ec",
                fontFamily: "var(--font-jetbrains, monospace)",
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                opacity: active ? 1 : 0.4,
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {!preview ? (
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LABEL_STYLE}>Objet</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={INPUT_STYLE}
              placeholder="Nouvelle collection printemps…"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LABEL_STYLE}>Corps (HTML autorisé)</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 12, lineHeight: 1.7 }}
              placeholder={"<p>Bonjour,</p>\n<p>Découvrez notre nouvelle pièce…</p>"}
            />
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.35, letterSpacing: "0.12em" }}>
            Utilisez {`{{UNSUB_URL}}`} pour le lien de désabonnement.
          </div>

          {result?.ok && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(100,190,100,0.9)" }}>
              ✓ {result.count} email{(result.count ?? 0) > 1 ? "s" : ""} envoyé{(result.count ?? 0) > 1 ? "s" : ""}.
            </div>
          )}
          {result?.error && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, color: "rgba(245,100,100,0.9)" }}>
              {result.error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setPreview(true)}
              disabled={!body}
              style={{ padding: "12px 20px", background: "transparent", border: "1px solid rgba(245,242,236,0.2)", color: "#f5f2ec", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: body ? 0.7 : 0.3 }}
            >
              Aperçu →
            </button>
            <button
              type="submit"
              disabled={sending}
              style={{ flex: 1, padding: "12px 20px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: sending ? 0.5 : 1 }}
            >
              {sending ? "Envoi…" : "Envoyer à tous les abonnés"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          {/* Aperçu */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: 8 }}>Objet</div>
            <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 18, opacity: subject ? 1 : 0.3 }}>
              {subject || "— aucun objet —"}
            </div>
          </div>
          <div style={{ border: "1px solid rgba(245,242,236,0.1)", overflow: "hidden", background: "#0a0a0a" }}>
            <iframe
              srcDoc={previewHtml}
              style={{ width: "100%", height: 400, border: "none", display: "block" }}
              title="Aperçu email"
            />
          </div>
          <button
            type="button"
            onClick={() => setPreview(false)}
            style={{ marginTop: 16, padding: "10px 20px", background: "transparent", border: "1px solid rgba(245,242,236,0.2)", color: "#f5f2ec", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: 0.6 }}
          >
            ← Retour à la rédaction
          </button>
        </div>
      )}
    </div>
  );
}
