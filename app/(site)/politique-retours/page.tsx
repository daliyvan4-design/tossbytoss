import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Retours — Toss by Toss",
  description: "Conditions de retour et d'échange pour les commandes Toss by Toss.",
};

const SECTION = { marginBottom: 48 } as const;
const H2 = {
  fontFamily: "var(--font-cormorant, Georgia, serif)",
  fontStyle: "italic" as const,
  fontWeight: 300,
  fontSize: 28,
  marginBottom: 18,
  lineHeight: 1.1,
};
const P = {
  fontFamily: "var(--font-montserrat, sans-serif)",
  fontSize: 14,
  lineHeight: 1.9,
  opacity: 0.72,
  marginBottom: 14,
};

export default function PolitiqueRetoursPage() {
  return (
    <main style={{ paddingTop: 140, position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 120px" }}>

        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", opacity: 0.35, marginBottom: 20 }}>
            Document légal
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            Politique de<br /><em>Retours</em>
          </h1>
          <p style={{ ...P, marginTop: 24, opacity: 0.4 }}>Valable pour toutes les commandes passées sur tossbytoss.ci</p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Délai de retour</h2>
          <p style={P}>
            Vous disposez de <strong>14 jours</strong> à compter de la date de réception de votre commande
            pour nous retourner un article, sans avoir à fournir de justification.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Conditions d'acceptation</h2>
          <p style={P}>Pour être accepté, tout retour doit satisfaire les conditions suivantes :</p>
          <ul style={{ ...P, paddingLeft: 24 }}>
            <li style={{ marginBottom: 10 }}>L'article doit être dans son état d'origine, non porté, non lavé.</li>
            <li style={{ marginBottom: 10 }}>Les étiquettes et emballages d'origine doivent être intacts.</li>
            <li style={{ marginBottom: 10 }}>L'article ne doit présenter aucune marque d'utilisation, rayure ou odeur.</li>
            <li style={{ marginBottom: 10 }}>Les articles personnalisés ou fabriqués sur mesure ne sont pas éligibles au retour.</li>
          </ul>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Procédure de retour</h2>
          <p style={P}>
            1. Contactez-nous via notre{" "}
            <a href="/contact" style={{ color: "inherit", opacity: 1, borderBottom: "1px solid currentColor" }}>formulaire de contact</a>{" "}
            ou par WhatsApp en indiquant votre référence de commande et le motif du retour.
          </p>
          <p style={P}>
            2. Nous vous transmettrons les instructions d'expédition dans un délai de 48h ouvrées.
          </p>
          <p style={P}>
            3. Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou d'erreur
            de notre part.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Remboursement</h2>
          <p style={P}>
            Dès réception et vérification de l'article retourné, nous procédons au remboursement dans un
            délai de <strong>5 à 10 jours ouvrés</strong>, via le même moyen de paiement utilisé lors de
            la commande. Le montant remboursé correspond au prix de l'article, hors frais de livraison
            initiaux.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Échange</h2>
          <p style={P}>
            Nous proposons l'échange d'un article contre un autre coloris ou une autre taille disponible
            en stock. Contactez-nous dans le délai de 14 jours pour convenir des modalités.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>Articles défectueux</h2>
          <p style={P}>
            Si vous recevez un article présentant un défaut de fabrication, contactez-nous immédiatement
            avec des photos du défaut. Nous prendrons en charge le retour et procéderons à un remplacement
            ou un remboursement intégral, frais de port inclus.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 40, ...P, opacity: 0.4 }}>
          Pour toute question, contactez-nous :{" "}
          <a href="/contact" style={{ color: "inherit", borderBottom: "1px solid currentColor" }}>page contact</a>.
        </div>

      </div>
    </main>
  );
}
