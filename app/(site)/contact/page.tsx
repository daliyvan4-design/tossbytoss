"use client";

import { useState } from "react";

const BOUTIQUES = [
  {
    name: "Angré",
    area: "Angré 8e Tranche",
    lines: ["Angré 8e Tranche, Star 11", "Face au Collège Sainte Camille", "Abidjan, Côte d'Ivoire"],
    query: "Collège Sainte Camille, Angré 8e Tranche, Abidjan",
  },
  {
    name: "Biétry",
    area: "Biétry · Marcory",
    lines: ["Boulevard de Marseille, Biétry", "Non loin du Rooftop", "Abidjan, Côte d'Ivoire"],
    query: "Boulevard de Marseille, Biétry, Abidjan",
  },
];

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

      {/* Section boutiques / carte */}
      <section id="boutiques" style={{ borderTop: "1px solid var(--hairline)", paddingTop: 120, paddingBottom: 120 }}>
        <div className="section-head">
          <div className="num-large">/ 06 — Nous trouver</div>
          <h2>Nos <em>Boutiques</em></h2>
          <div className="right">Abidjan · Côte d'Ivoire</div>
        </div>

        <div className="boutiques-grid">
          {BOUTIQUES.map((b) => (
            <div key={b.name} className="boutique-card">
              <div className="map-frame">
                <iframe
                  title={`Carte — ${b.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(b.query)}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="map-badge">{b.area}</div>
              </div>
              <div className="boutique-info">
                <div className="boutique-name">{b.name}</div>
                {b.lines.map((l) => (
                  <div key={l} className="boutique-line">{l}</div>
                ))}
                <a
                  className="itineraire-btn"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Itinéraire</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          ))}
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
        /* ── Boutiques / carte ── */
        .boutiques-grid {
          max-width: 1200px; margin: 0 auto; padding: 64px 80px 0;
          display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
        }
        .boutique-card { display: flex; flex-direction: column; }
        .map-frame {
          position: relative; aspect-ratio: 4 / 3;
          border: 1px solid var(--hairline); overflow: hidden;
          background: color-mix(in oklab, var(--fg) 8%, transparent);
        }
        .map-frame iframe {
          width: 100%; height: 100%; border: 0; display: block;
          filter: grayscale(1) contrast(1.04);
          transition: filter 500ms ease;
        }
        .map-frame:hover iframe { filter: grayscale(0) contrast(1); }
        html[data-mode="night"] .map-frame iframe {
          filter: grayscale(1) invert(0.92) hue-rotate(180deg) contrast(0.9);
        }
        html[data-mode="night"] .map-frame:hover iframe {
          filter: invert(0.92) hue-rotate(180deg);
        }
        .map-badge {
          position: absolute; top: 14px; left: 14px; z-index: 2;
          background: var(--panel); color: var(--panel-fg);
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; padding: 7px 14px; pointer-events: none;
        }
        .boutique-info { padding-top: 26px; }
        .boutique-name {
          font-family: var(--serif); font-style: italic; font-weight: 300;
          font-size: 30px; line-height: 1; margin-bottom: 16px;
        }
        .boutique-line {
          font-family: var(--serif); font-size: 17px; line-height: 1.7; opacity: 0.7;
        }
        .itineraire-btn {
          display: inline-flex; align-items: center; gap: 14px; margin-top: 22px;
          padding: 14px 30px; border: 1px solid var(--fg);
          background: var(--fg); color: var(--bg);
          font-family: var(--mono); font-size: 10px; letter-spacing: 0.26em;
          text-transform: uppercase; text-decoration: none;
          transition: opacity 250ms ease;
        }
        .itineraire-btn:hover { opacity: 0.78; }

        @media (max-width: 900px) {
          #contact > div:last-child { grid-template-columns: 1fr !important; padding: 48px 32px 0 !important; gap: 48px !important; }
          .boutiques-grid { grid-template-columns: 1fr !important; padding: 48px 24px 0 !important; gap: 44px !important; }
        }
      `}</style>
    </>
  );
}
