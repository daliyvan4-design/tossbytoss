import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Toss by Toss",
  description: "Conditions générales de vente de Toss by Toss, maison de maroquinerie artisanale basée à Abidjan.",
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

export default function CGVPage() {
  return (
    <main style={{ paddingTop: 140, position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 120px" }}>

        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", opacity: 0.35, marginBottom: 20 }}>
            Document légal
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            Conditions Générales<br /><em>de Vente</em>
          </h1>
          <p style={{ ...P, marginTop: 24, opacity: 0.4 }}>En vigueur à compter du 1er janvier 2025</p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>1. Identification du vendeur</h2>
          <p style={P}>
            Toss by Toss est une maison de maroquinerie artisanale basée à Abidjan, Côte d'Ivoire.
            Atelier situé au Plateau, Abidjan. Contact : via le formulaire sur{" "}
            <a href="/contact" style={{ color: "inherit", opacity: 1, borderBottom: "1px solid currentColor" }}>notre page contact</a>.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>2. Objet</h2>
          <p style={P}>
            Les présentes conditions générales de vente régissent les relations contractuelles entre Toss by Toss
            et tout acheteur effectuant une commande via le site tossbytoss.ci. Toute commande implique l'acceptation
            sans réserve des présentes conditions.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>3. Produits</h2>
          <p style={P}>
            Tous nos articles sont fabriqués artisanalement en cuir pleine fleur dans notre atelier d'Abidjan.
            Les photographies et descriptions sont aussi fidèles que possible, mais de légères variations de
            couleur ou de texture peuvent exister d'une pièce à l'autre — elles témoignent du caractère unique
            de chaque création.
          </p>
          <p style={P}>
            Les prix sont indiqués en Francs CFA (XOF), toutes taxes incluses. Toss by Toss se réserve
            le droit de modifier ses prix à tout moment, les commandes étant facturées au tarif en vigueur
            lors de la validation de la commande.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>4. Commande et paiement</h2>
          <p style={P}>
            La commande est validée après confirmation du paiement par notre prestataire Genius Pay.
            Un email de confirmation vous est adressé dès validation. Toss by Toss se réserve le droit
            d'annuler toute commande en cas de suspicion de fraude ou de rupture de stock avérée.
          </p>
          <p style={P}>
            Les paiements sont traités de manière sécurisée via Genius Pay. Toss by Toss ne stocke
            aucune donnée bancaire.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>5. Livraison</h2>
          <p style={P}>
            Les délais de livraison indicatifs sont les suivants :
          </p>
          <ul style={{ ...P, paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>Abidjan : 1 à 2 jours ouvrés</li>
            <li style={{ marginBottom: 8 }}>Côte d'Ivoire (hors Abidjan) : 2 à 5 jours ouvrés</li>
            <li style={{ marginBottom: 8 }}>International : 5 à 10 jours ouvrés</li>
          </ul>
          <p style={P}>
            Ces délais courent à partir de la confirmation du paiement. Toss by Toss ne saurait être
            tenu responsable des retards imputables aux transporteurs ou à des événements de force majeure.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>6. Droit de rétractation & retours</h2>
          <p style={P}>
            Conformément à notre politique de retours, vous disposez de 14 jours à compter de la réception
            de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni
            à payer de pénalités. Consultez notre{" "}
            <a href="/politique-retours" style={{ color: "inherit", opacity: 1, borderBottom: "1px solid currentColor" }}>
              politique de retours
            </a>{" "}
            pour les modalités complètes.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>7. Propriété intellectuelle</h2>
          <p style={P}>
            L'ensemble des éléments du site (photographies, textes, identité visuelle, nom de marque) est
            la propriété exclusive de Toss by Toss. Toute reproduction, même partielle, est interdite
            sans autorisation écrite préalable.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>8. Données personnelles</h2>
          <p style={P}>
            Les données collectées lors de la commande (nom, email, téléphone) sont utilisées exclusivement
            pour le traitement de votre commande et, avec votre accord, pour l'envoi de notre newsletter.
            Elles ne sont jamais transmises à des tiers commerciaux. Vous disposez d'un droit d'accès,
            de rectification et de suppression en nous contactant.
          </p>
        </div>

        <div style={SECTION}>
          <h2 style={H2}>9. Droit applicable</h2>
          <p style={P}>
            Les présentes conditions sont soumises au droit ivoirien. En cas de litige, les parties
            s'engagent à rechercher une solution amiable avant tout recours judiciaire.
          </p>
        </div>

      </div>
    </main>
  );
}
