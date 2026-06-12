import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Galerie — Toss by Toss" };

export default function MoodboardPage() {
  return (
    <section id="galerie" style={{ paddingTop: 180 }}>
      <div className="section-head">
        <div className="num-large">/ 03 — Galerie</div>
        <h2>La <em>Communauté</em></h2>
        <div className="right">Clients & Conceptions</div>
      </div>

      <div className="galerie-intro">
        <p className="galerie-lead">Chaque pièce trouve sa personne. Voici quelques-unes de ces rencontres — des clients qui portent Toss by Toss au quotidien, et les esquisses qui donnent naissance aux créations.</p>
      </div>

      <div className="galerie-label">
        <span className="eyebrow">Clients réguliers</span>
        <div className="galerie-rule" />
      </div>

      <div className="galerie-grid">
        {[
          { cls: "gf-tall", img: "/uploads/WaveSpeed AI Image (2).png", name: "Aminata D.", note: "Sandales Ivoire · Porto-Novo" },
          { cls: "gf-wide", img: "/uploads/WaveSpeed AI Image (3).png", name: "Kofi A.", note: "Sac Croco Noir · Abidjan" },
          { cls: "gf-square", img: "/uploads/WaveSpeed AI Image (5).png", name: "Fatoumata B.", note: "Derby Caramel · Dakar" },
          { cls: "gf-square", img: "/uploads/AI Images Creation.png", name: "Habiba T.", note: "Mule Dorée · Abidjan" },
          { cls: "gf-tall", img: "/uploads/AI Images from Text & Photo (1).png", name: "Séraphin M.", note: "Cartable Tabac · Paris" },
          { cls: "gf-wide", img: "/uploads/Image générée WaveSpeed AI (2).png", name: "Nadia K.", note: "Pochette Nude · Abidjan" },
        ].map(({ cls, img, name, note }) => (
          <figure key={name} className={`galerie-frame ${cls}`}>
            <div className="galerie-img" style={{ backgroundImage: `url('${img}')` }} />
            <figcaption>
              <span className="gf-name">{name}</span>
              <span className="gf-note">{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="galerie-sep">
        <div className="galerie-sep-line" />
        <span className="galerie-sep-text">Carnets de conception</span>
        <div className="galerie-sep-line" />
      </div>

      <div className="galerie-label">
        <span className="eyebrow">Esquisses & processus</span>
        <div className="galerie-rule" />
      </div>

      <div className="galerie-grid galerie-grid--conception">
        {[
          { cls: "gf-wide", img: "/uploads/Image générée WaveSpeed AI (2)-edc11dba.png", name: "Esquisse № 12", note: "Sac structuré · Étude de coupe" },
          { cls: "gf-square", img: "/assets/leather-black.png", name: "Cuir pleine fleur", note: "Tannage végétal · Matière première" },
          { cls: "gf-square", img: "/assets/leather-white.png", name: "Cuir naturel ivoire", note: "Avant finition · Atelier № 04" },
          { cls: "gf-tall", img: "/uploads/WaveSpeed AI Image (2).png", name: "Gabarit sandale", note: "Modèle S-07 · Traçage à la craie" },
          { cls: "gf-wide", img: "/uploads/WaveSpeed AI Image (3).png", name: "Atelier Plateau", note: "En cours de fabrication · Mai 2026" },
        ].map(({ cls, img, name, note }) => (
          <figure key={name} className={`galerie-frame ${cls}`}>
            <div className="galerie-img" style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover" }} />
            <figcaption>
              <span className="gf-name">{name}</span>
              <span className="gf-note">{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="galerie-closing">
        <blockquote className="galerie-quote">
          Chaque photo est une pièce qui vit.<span style={{ opacity: 0.35 }}>"</span>
        </blockquote>
        <Link href="/contact" className="cta" style={{ marginTop: 40 }}>
          <span>Commandez sur mesure</span>
          <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
