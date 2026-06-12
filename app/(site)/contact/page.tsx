"use client";

import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="newsletter" style={{ paddingTop: 180 }}>
      <div className="newsletter">
        <div className="eyebrow" style={{ marginBottom: 28 }}>/ 05 — Le cercle</div>
        <h2>Entrez dans le <em>cercle</em>.</h2>
        <div className="sub">Nouveautés, éditions limitées, événements privés.</div>

        <form className="news-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre adresse e-mail"
            autoComplete="email"
            disabled={status === "loading"}
          />
          <button type="submit" className="news-btn" disabled={status === "loading"}>
            <span>{status === "loading" ? "…" : "Rejoindre"}</span>
            <span>→</span>
          </button>
        </form>

        <div className="news-fineprint">Une lettre par saison · Désabonnement libre</div>

        {status === "success" && (
          <div className="news-success show">— Bienvenue. À très vite.</div>
        )}
        {status === "error" && (
          <div className="news-success show" style={{ opacity: 0.7 }}>— Une erreur s'est produite. Réessayez.</div>
        )}
      </div>
    </section>
  );
}
