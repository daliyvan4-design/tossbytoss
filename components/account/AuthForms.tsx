"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const INPUT = {
  width: "100%",
  background: "transparent",
  border: "1px solid var(--hairline)",
  padding: "14px 18px",
  fontFamily: "var(--font-montserrat, sans-serif)",
  fontSize: 14,
  color: "var(--fg)",
  outline: "none",
  boxSizing: "border-box" as const,
};

const LABEL = {
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 9,
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
  opacity: 0.45,
  marginBottom: 8,
  display: "block",
};

const BTN = {
  padding: "16px 28px",
  background: "var(--fg)",
  color: "var(--bg)",
  border: "none",
  fontFamily: "var(--font-jetbrains, monospace)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
};

export function AuthForms({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [busy, setBusy] = useState(false);

  function switchMode(m: "login" | "signup") {
    setMode(m); setStep("form"); setError(""); setInfo(""); setShowResend(false);
  }

  async function finishLogin() {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Connexion impossible. Réessayez."); setBusy(false); return; }
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setShowResend(false); setBusy(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, newsletter }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setError(data.error ?? "Erreur lors de la création du compte."); setBusy(false); return; }
        setStep("otp");
        setInfo("Un code de vérification vient d'être envoyé à votre email.");
        setBusy(false);
        return;
      }

      // Connexion
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
        setShowResend(true); // au cas où l'email n'aurait pas été vérifié
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Code incorrect."); setBusy(false); return; }
      await finishLogin();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(""); setInfo(""); setBusy(true);
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("otp");
      setShowResend(false);
      setInfo("Un nouveau code a été envoyé à votre email.");
    } catch {
      setError("Impossible d'envoyer le code. Réessayez.");
    }
    setBusy(false);
  }

  // ── Étape OTP ──────────────────────────────────
  if (step === "otp") {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.45, marginBottom: 12 }}>
            Vérification
          </div>
          <p style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, opacity: 0.7 }}>
            Saisissez le code à 6 chiffres envoyé à<br /><span style={{ opacity: 1 }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            style={{ ...INPUT, textAlign: "center", fontSize: 30, letterSpacing: "0.5em", fontFamily: "var(--font-jetbrains, monospace)", paddingLeft: 28 }}
          />

          {info && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, color: "rgba(80,160,100,0.9)", textAlign: "center" }}>{info}</div>}
          {error && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, color: "rgba(200,80,60,0.9)", textAlign: "center" }}>{error}</div>}

          <button type="submit" disabled={busy || code.length !== 6} style={{ ...BTN, opacity: busy || code.length !== 6 ? 0.5 : 1 }}>
            {busy ? "Vérification…" : "Vérifier & se connecter"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" onClick={handleResend} disabled={busy} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.55, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", textDecoration: "underline" }}>
            Renvoyer le code
          </button>
          <button type="button" onClick={() => switchMode(mode)} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.35, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}>
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // ── Étape formulaire (login / signup) ──────────
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--hairline)", marginBottom: 36 }}>
        {([["login", "Se connecter"], ["signup", "Créer un compte"]] as const).map(([m, label]) => (
          <button key={m} type="button" onClick={() => switchMode(m)} style={{
            flex: 1, padding: "14px 0", background: "transparent", border: "none",
            borderBottom: mode === m ? "2px solid var(--fg)" : "2px solid transparent",
            color: "var(--fg)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10,
            letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer",
            opacity: mode === m ? 1 : 0.4, marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {mode === "signup" && (
          <div>
            <label style={LABEL}>Nom complet</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aminata Konaté" style={INPUT} />
          </div>
        )}
        <div>
          <label style={LABEL}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" style={INPUT} />
        </div>
        <div>
          <label style={LABEL}>Mot de passe {mode === "signup" && <span style={{ letterSpacing: "0.1em", textTransform: "none" }}>— 8 caractères min.</span>}</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={INPUT} />
        </div>

        {mode === "signup" && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
            <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "var(--fg)" }} />
            <span>Je souhaite recevoir la newsletter — nouveautés, éditions limitées et invitations privées.</span>
          </label>
        )}

        {info && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, color: "rgba(80,160,100,0.9)" }}>{info}</div>}
        {error && <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, color: "rgba(200,80,60,0.9)" }}>{error}</div>}

        {showResend && (
          <button type="button" onClick={handleResend} disabled={busy} style={{ background: "none", border: "none", textAlign: "left", color: "var(--fg)", opacity: 0.6, fontFamily: "var(--font-jetbrains, monospace)", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer", textDecoration: "underline", marginTop: -8 }}>
            Email non vérifié ? Renvoyer le code de vérification →
          </button>
        )}

        <button type="submit" disabled={busy} style={{ ...BTN, opacity: busy ? 0.5 : 1 }}>
          {busy ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            <span style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>
          <button type="button" onClick={() => signIn("google")} style={{
            width: "100%", padding: "15px 28px", background: "transparent", border: "1px solid var(--hairline)",
            color: "var(--fg)", fontFamily: "var(--font-jetbrains, monospace)", fontSize: 10, letterSpacing: "0.2em",
            textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
        </>
      )}

      <p style={{ marginTop: 36, fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontSize: 15, lineHeight: 1.7, opacity: 0.45, textAlign: "center" }}>
        Le compte est facultatif — vous pouvez commander sans vous inscrire.
      </p>
    </div>
  );
}
