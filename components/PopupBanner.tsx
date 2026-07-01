"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PopupConfig {
  active:   boolean;
  badge:    string;
  title:    string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl:   string;
}

const STORAGE_KEY = "tbt_popup_dismissed";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < TTL_MS;
  } catch { return false; }
}

function markDismissed() {
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ok */ }
}

export default function PopupBanner() {
  const [config, setConfig]   = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch("/api/popup")
      .then((r) => r.json())
      .then((d: PopupConfig) => {
        if (!d.active || wasDismissedRecently()) return;
        setConfig(d);
        // Apparaît après 700ms pour laisser la page se charger
        const t = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(t);
      })
      .catch(() => null);
  }, []);

  function dismiss() {
    setClosing(true);
    markDismissed();
    setTimeout(() => { setVisible(false); setClosing(false); }, 400);
  }

  if (!config || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        opacity: closing ? 0 : 1,
        transition: "opacity 400ms ease",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "55fr 45fr",
        width: "min(960px, 94vw)",
        height: "min(600px, 88vh)",
        background: "#0a0a0a",
        overflow: "hidden",
        transform: closing ? "scale(0.97)" : "scale(1)",
        transition: "transform 400ms ease",
        boxShadow: "0 40px 120px -20px rgba(0,0,0,0.8)",
      }}>

        {/* Panneau image gauche */}
        <div style={{
          backgroundImage: config.imageUrl ? `url('${config.imageUrl}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: config.imageUrl ? undefined : "rgba(245,242,236,0.04)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Gradient overlay lateral */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, transparent 60%, rgba(10,10,10,0.6) 100%)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Panneau contenu droite */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 44px",
          background: "#0a0a0a",
          color: "#f5f2ec",
          position: "relative",
        }}>
          {/* Badge */}
          {config.badge && (
            <div style={{
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: 9,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 22,
            }}>
              {config.badge}
            </div>
          )}

          {/* Titre */}
          {config.title && (
            <h2 style={{
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: "#f5f2ec",
              margin: "0 0 20px",
            }}>
              {config.title}
            </h2>
          )}

          {/* Filet déco */}
          <div style={{ width: 40, height: 1, background: "rgba(245,242,236,0.3)", marginBottom: 20 }} />

          {/* Sous-titre */}
          {config.subtitle && (
            <p style={{
              fontFamily: "var(--font-sans, 'Helvetica Neue', sans-serif)",
              fontWeight: 300,
              fontSize: 14,
              lineHeight: 1.75,
              opacity: 0.75,
              margin: "0 0 36px",
              maxWidth: "32ch",
            }}>
              {config.subtitle}
            </p>
          )}

          {/* CTA */}
          {config.ctaLabel && (
            <Link
              href={config.ctaUrl || "/marketplace"}
              onClick={dismiss}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 28px",
                background: "rgba(245,242,236,0.92)",
                color: "#0a0a0a",
                fontFamily: "var(--font-sans, 'Helvetica Neue', sans-serif)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                textDecoration: "none",
                alignSelf: "flex-start",
                transition: "opacity 300ms",
              }}
            >
              {config.ctaLabel}
              <span style={{ fontSize: 14 }}>→</span>
            </Link>
          )}

          {/* Lien discret "plus tard" */}
          <button
            onClick={dismiss}
            style={{
              marginTop: 18,
              background: "transparent",
              border: "none",
              color: "#f5f2ec",
              fontFamily: "var(--font-jetbrains, monospace)",
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              opacity: 0.35,
              cursor: "pointer",
              alignSelf: "flex-start",
              padding: 0,
            }}
          >
            Plus tard
          </button>
        </div>

        {/* Bouton fermer × */}
        <button
          onClick={dismiss}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            background: "rgba(245,242,236,0.08)",
            border: "1px solid rgba(245,242,236,0.15)",
            color: "#f5f2ec",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            lineHeight: 1,
            zIndex: 10,
            transition: "background 200ms",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
