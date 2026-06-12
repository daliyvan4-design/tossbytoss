import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fr" data-mode="day">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0a", color: "#f5f2ec", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <main style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "40px 24px",
          position: "relative",
        }}>

          <div>
            <div style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(100px, 22vw, 200px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              opacity: 0.08,
              marginBottom: 0,
              userSelect: "none",
            }}>
              404
            </div>

            <div style={{ marginTop: -32, position: "relative", zIndex: 1 }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                opacity: 0.4,
                marginBottom: 20,
              }}>
                Page introuvable
              </div>

              <h1 style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(32px, 6vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                marginBottom: 24,
              }}>
                Cette page n&apos;existe pas
              </h1>

              <p style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 18,
                lineHeight: 1.7,
                opacity: 0.6,
                maxWidth: "40ch",
                margin: "0 auto 48px",
              }}>
                La pièce que vous cherchez a peut-être été retirée, ou l&apos;adresse est incorrecte.
              </p>

              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/" style={{
                  padding: "15px 28px",
                  background: "#f5f2ec",
                  color: "#0a0a0a",
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}>
                  Accueil
                </Link>
                <Link href="/marketplace" style={{
                  padding: "15px 28px",
                  border: "1px solid rgba(245,242,236,0.2)",
                  color: "#f5f2ec",
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}>
                  La Collection
                </Link>
              </div>
            </div>
          </div>

        </main>
      </body>
    </html>
  );
}
