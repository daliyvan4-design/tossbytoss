import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galerie — Toss by Toss" };

const ASPECT_CLASS: Record<string, string> = {
  TALL: "gf-tall",
  WIDE: "gf-wide",
  SQUARE: "gf-square",
};

export default async function MoodboardPage() {
  const items = await db.galleryItem.findMany({
    where: { active: true },
    orderBy: [{ section: "asc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  const clients    = items.filter((i) => i.section === "CLIENTS");
  const conception = items.filter((i) => i.section === "CONCEPTION");

  const FALLBACK_CLIENTS = [
    { id: "f1", cls: "gf-tall",   img: "/uploads/WaveSpeed AI Image (2).png",          name: "Aminata D.",   note: "Sandales Ivoire · Porto-Novo" },
    { id: "f2", cls: "gf-wide",   img: "/uploads/WaveSpeed AI Image (3).png",          name: "Kofi A.",      note: "Sac Croco Noir · Abidjan" },
    { id: "f3", cls: "gf-square", img: "/uploads/WaveSpeed AI Image (5).png",          name: "Fatoumata B.", note: "Derby Caramel · Dakar" },
    { id: "f4", cls: "gf-square", img: "/uploads/AI Images Creation.png",              name: "Habiba T.",    note: "Mule Dorée · Abidjan" },
    { id: "f5", cls: "gf-tall",   img: "/uploads/AI Images from Text & Photo (1).png", name: "Séraphin M.", note: "Cartable Tabac · Paris" },
    { id: "f6", cls: "gf-wide",   img: "/uploads/Image générée WaveSpeed AI (2).png",  name: "Nadia K.",     note: "Pochette Nude · Abidjan" },
  ];
  const FALLBACK_CONCEPTION = [
    { id: "c1", cls: "gf-wide",   img: "/uploads/Image générée WaveSpeed AI (2)-edc11dba.png", name: "Esquisse № 12",     note: "Sac structuré · Étude de coupe" },
    { id: "c2", cls: "gf-square", img: "/assets/leather-black.png",                             name: "Cuir pleine fleur", note: "Tannage végétal · Matière première" },
    { id: "c3", cls: "gf-square", img: "/assets/leather-white.png",                             name: "Cuir naturel ivoire", note: "Avant finition · Atelier № 04" },
    { id: "c4", cls: "gf-tall",   img: "/uploads/WaveSpeed AI Image (2).png",                   name: "Gabarit sandale",   note: "Modèle S-07 · Traçage à la craie" },
    { id: "c5", cls: "gf-wide",   img: "/uploads/WaveSpeed AI Image (3).png",                   name: "Atelier Plateau",   note: "En cours de fabrication · Juin 2026" },
  ];

  const showClients    = clients.length > 0
    ? clients.map((i) => ({ id: i.id, cls: ASPECT_CLASS[i.aspect] ?? "gf-square", img: i.imageUrl, name: i.name, note: i.note }))
    : FALLBACK_CLIENTS;
  const showConception = conception.length > 0
    ? conception.map((i) => ({ id: i.id, cls: ASPECT_CLASS[i.aspect] ?? "gf-square", img: i.imageUrl, name: i.name, note: i.note }))
    : FALLBACK_CONCEPTION;

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
        {showClients.map(({ id, cls, img, name, note }) => (
          <figure key={id} className={`galerie-frame ${cls}`}>
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
        {showConception.map(({ id, cls, img, name, note }) => (
          <figure key={id} className={`galerie-frame ${cls}`}>
            <div className="galerie-img" style={{ backgroundImage: `url('${img}')` }} />
            <figcaption>
              <span className="gf-name">{name}</span>
              <span className="gf-note">{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {clients.length === 0 && conception.length === 0 && (
        <p style={{ textAlign: "center", padding: "48px 0 0", fontFamily: "var(--font-cormorant, Georgia, serif)", fontStyle: "italic", opacity: 0.3, fontSize: 16 }}>
          Photos de démo · <Link href="/admin/moodboard" style={{ color: "inherit" }}>Gérer via l&apos;admin →</Link>
        </p>
      )}
    </section>
  );
}
