"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface PopupData {
  active:   boolean;
  badge:    string;
  title:    string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl:   string;
}

const DEFAULTS: PopupData = {
  active:   false,
  badge:    "Édition Fête",
  title:    "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "Découvrir la collection",
  ctaUrl:   "/marketplace",
};

const INPUT = {
  background: "transparent",
  border: "1px solid rgba(245,242,236,0.18)",
  padding: "10px 14px",
  fontFamily: "var(--font-cormorant, Georgia, serif)",
  fontSize: 17,
  color: "inherit",
  outline: "none",
  width: "100%",
} as const;

const LBL = {
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 9,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  opacity: 0.55,
};

export default function PopupAdminPage() {
  const [form, setForm]       = useState<PopupData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch("/api/admin/popup")
      .then((r) => r.json())
      .then((d) => { setForm({ ...DEFAULTS, ...d }); setLoading(false); });
  }, []);

  async function save(patch: Partial<PopupData>) {
    const next = { ...form, ...patch };
    setForm(next);
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/popup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return (
    <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, opacity: 0.4, letterSpacing: "0.2em" }}>Chargement…</div>
  );

  return (
    <>
      {/* En-tête */}
      <div style={{ marginBottom: 48, borderBottom: "1px solid rgba(245,242,236,0.10)", paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>/ 08 — Popup</div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: 48, lineHeight: 1 }}>Popup d'accueil</h1>
        </div>
        {/* Toggle actif */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: form.active ? 1 : 0.45 }}>
            {form.active ? "Actif" : "Inactif"}
          </span>
          <button
            onClick={() => save({ active: !form.active })}
            style={{
              width: 56,
              height: 28,
              borderRadius: 999,
              border: "1px solid rgba(245,242,236,0.35)",
              background: form.active ? "rgba(100,190,100,0.25)" : "transparent",
              cursor: "pointer",
              position: "relative",
              transition: "background 300ms",
            }}
          >
            <span style={{
              position: "absolute",
              top: 4,
              left: form.active ? 30 : 4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: form.active ? "rgba(100,190,100,0.9)" : "rgba(245,242,236,0.35)",
              transition: "left 300ms, background 300ms",
            }} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 48 }}>
        {/* Formulaire */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LBL}>Badge (ex: Édition Noël, Collection Été…)</label>
            <input type="text" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} style={INPUT} placeholder="Édition Fête" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LBL}>Titre principal</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ ...INPUT, fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: 22 }} placeholder="Nuit de Décembre" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LBL}>Sous-titre</label>
            <textarea
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              rows={3}
              style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Une sélection de pièces d'exception pour offrir ou se faire plaisir."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LBL}>Image (portrait recommandé)</label>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={LBL}>Label bouton</label>
              <input type="text" value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} style={{ ...INPUT, fontSize: 14 }} placeholder="Découvrir la collection" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={LBL}>URL bouton</label>
              <input type="text" value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} style={{ ...INPUT, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 13 }} placeholder="/marketplace" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
            <button
              onClick={() => save({})}
              disabled={saving}
              style={{ padding: "14px 32px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            {saved && <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(100,190,100,0.9)" }}>✓ Sauvegardé</span>}
          </div>
        </div>

        {/* Aperçu miniature */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.45 }}>Aperçu</div>
          <div style={{
            border: "1px solid rgba(245,242,236,0.15)",
            overflow: "hidden",
            background: "#0a0a0a",
            aspectRatio: "9/16",
            maxHeight: 480,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}>
            {form.imageUrl && (
              <div style={{ flex: 1, backgroundImage: `url('${form.imageUrl}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
            )}
            {!form.imageUrl && (
              <div style={{ flex: 1, background: "rgba(245,242,236,0.05)", display: "grid", placeItems: "center" }}>
                <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.2, letterSpacing: "0.2em" }}>IMAGE</span>
              </div>
            )}
            <div style={{ padding: "20px 18px", background: "#0a0a0a", display: "flex", flexDirection: "column", gap: 8 }}>
              {form.badge && (
                <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.6 }}>{form.badge}</span>
              )}
              {form.title && (
                <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1.05, color: "#f5f2ec" }}>{form.title}</div>
              )}
              {form.subtitle && (
                <div style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 10, fontWeight: 300, opacity: 0.7, lineHeight: 1.5 }}>{form.subtitle}</div>
              )}
              {form.ctaLabel && (
                <div style={{ marginTop: 4, padding: "8px 14px", background: "rgba(245,242,236,0.9)", color: "#0a0a0a", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", display: "inline-block", alignSelf: "flex-start" }}>
                  {form.ctaLabel}
                </div>
              )}
            </div>
          </div>
          {!form.active && (
            <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, opacity: 0.4, letterSpacing: "0.15em", textAlign: "center" }}>
              Activez le toggle pour afficher sur le site
            </div>
          )}
        </div>
      </div>
    </>
  );
}
