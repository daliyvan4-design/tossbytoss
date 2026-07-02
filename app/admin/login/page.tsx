"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-montserrat, 'Helvetica Neue', sans-serif)",
    }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontStyle: "normal", fontSize: 32, color: "#111111", letterSpacing: "-0.01em", marginBottom: 8 }}>
            Toss by Toss
          </div>
          <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#111111", opacity: 0.4 }}>
            Admin Panel
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "#111111", opacity: 0.5, marginBottom: 10 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%",
                background: "rgba(17,17,17,0.06)",
                border: error ? "1px solid rgba(220,80,60,0.7)" : "1px solid rgba(17,17,17,0.15)",
                color: "#111111",
                fontFamily: "var(--font-montserrat, sans-serif)",
                fontSize: 14,
                padding: "14px 16px",
                outline: "none",
                letterSpacing: "0.1em",
              }}
            />
          </div>

          {error && (
            <div style={{ fontFamily: "var(--font-montserrat, sans-serif)", fontSize: 10, color: "rgba(220,80,60,0.9)", letterSpacing: "0.1em" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "16px",
              background: loading ? "rgba(17,17,17,0.2)" : "#111111",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-montserrat, sans-serif)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              cursor: loading ? "default" : "pointer",
              transition: "opacity 200ms",
              opacity: loading ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            {loading ? "…" : "Accéder →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
