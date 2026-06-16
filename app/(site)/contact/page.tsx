"use client";

import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setNewsStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setNewsStatus("success");
      setEmail("");
    } catch {
      setNewsStatus("error");
    }
  }

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setContactStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setContactStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setContactStatus("error");
    }
  }

  return (
    <>
      {/* Section contact */}
      <section id="contact" style={{ paddingTop: 180, paddingBottom: 120 }}>
        <div className="section-head">
          <div className="num-large">/ 05 — Contact</div>
          <h2>Nous <em>écrire</em></h2>
          <div className="right">Commandes sur mesure & questions</div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 80px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96 }}>
          {/* Formulaire */}
          <div>
            {contactStatus === "success" ? (
              <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.6, opacity: 0.85 }}>
                — Message envoyé.<br />
                <span style={{ opacity: 0.55, fontSize: 18 }}>Nous vous répondrons sous 24–48 h.</span>
              </div>
            ) : (
              <form onSubmit={handleContact} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  { key: "name",    label: "Nom",     type: "text",  placeholder: "Aminata Konaté" },
                  { key: "email",   label: "Email",   type: "email", placeholder: "aminata@exemple.com" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5 }}>{label}</label>
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--hairline)", padding: "12px 0", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 20, color: "var(--fg)", outline: "none", width: "100%" }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5 }}>Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Bonjour, je souhaite commander un sac sur mesure…"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    style={{ background: "transparent", border: "1px solid var(--hairline)", padding: "16px", fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 18, color: "var(--fg)", outline: "none", width: "100%", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
                {contactStatus === "error" && (
                  <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, color: "rgba(200,80,60,0.8)", letterSpacing: "0.15em" }}>Erreur lors de l'envoi. Réessayez.</div>
                )}
                <button
                  type="submit"
                  disabled={contactStatus === "loading"}
                  className="news-btn"
                  style={{ alignSelf: "flex-start", padding: "14px 40px" }}
                >
                  <span>{contactStatus === "loading" ? "Envoi…" : "Envoyer le message"}</span>
                  <span>→</span>
                </button>
              </form>
            )}
          </div>

          {/* Infos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48, paddingTop: 8 }}>
            {[
              { label: "Atelier", lines: ["Atelier № 04, Plateau", "Abidjan, Côte d'Ivoire"] },
              { label: "Horaires", lines: ["Lundi – Samedi", "9 h – 18 h"] },
              { label: "WhatsApp", lines: ["+225 XX XX XX XX XX"] },
              { label: "Instagram", lines: ["@tossbytoss"] },
            ].map(({ label, lines }) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, letterSpacing: "0.38em", textTransform: "uppercase", opacity: 0.38, marginBottom: 10 }}>{label}</div>
                {lines.map((l) => (
                  <div key={l} style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 20, lineHeight: 1.6, opacity: 0.8 }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section newsletter */}
      <section id="newsletter" style={{ borderTop: "1px solid var(--hairline)", paddingTop: 80, paddingBottom: 120 }}>
        <div className="newsletter">
          <div className="eyebrow" style={{ marginBottom: 28 }}>Le cercle</div>
          <h2>Entrez dans le <em>cercle</em>.</h2>
          <div className="sub">Nouveautés, éditions limitées, événements privés.</div>

          <form className="news-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre adresse e-mail"
              autoComplete="email"
              disabled={newsStatus === "loading"}
            />
            <button type="submit" className="news-btn" disabled={newsStatus === "loading"}>
              <span>{newsStatus === "loading" ? "…" : "Rejoindre"}</span>
              <span>→</span>
            </button>
          </form>

          <div className="news-fineprint">Une lettre par saison · Désabonnement libre</div>

          {newsStatus === "success" && (
            <div className="news-success show">— Bienvenue. À très vite.</div>
          )}
          {newsStatus === "error" && (
            <div className="news-success show" style={{ opacity: 0.7 }}>— Une erreur s'est produite. Réessayez.</div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          #contact > div:last-child { grid-template-columns: 1fr !important; padding: 48px 32px 0 !important; gap: 48px !important; }
        }
      `}</style>
    </>
  );
}
