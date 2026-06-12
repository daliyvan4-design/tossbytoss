import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos — Toss by Toss" };

export default function AboutPage() {
  return (
    <>
      <section id="about" style={{ paddingTop: 180 }}>
        <div className="section-head">
          <div className="num-large">/ 04 — À propos</div>
          <h2>La <em>Maison</em></h2>
          <div className="right">Depuis mmxviii</div>
        </div>
        <div className="about">
          <blockquote className="pull-quote">
            Chaque pièce est une conversation entre la main et la matière.<span style={{ opacity: 0.4 }}>"</span>
          </blockquote>
          <div className="about-right">
            <div><div className="eyebrow">Notre histoire</div></div>
            <p className="about-body">
              Toss by Toss est née dans un petit atelier du Plateau d'une obsession unique&nbsp;: élever le cuir ouest-africain au rang de la grande maroquinerie. Sandales, souliers, sacs — chaque pièce est dessinée à Abidjan, taillée à la main, finie au point sellier. Aucune presse, aucune machine. Le temps qu'il faut, et pas un instant de moins.
            </p>
            <div className="about-stats">
              {[
                { label: "Fondée", value: "Est. 2018" },
                { label: "Ville", value: "Abidjan, CI" },
                { label: "Artisans", value: "Quatorze" },
                { label: "Pièces / an", value: "≈ 600" },
              ].map(({ label, value }) => (
                <div className="stat" key={label}>
                  <div className="label">{label}</div>
                  <div className="value">{value}</div>
                </div>
              ))}
            </div>
            <div className="about-detail">Boutique physique &amp; en ligne</div>
          </div>
        </div>
      </section>

      {/* L'Atelier */}
      <section className="about-photos-section">
        <div className="about-photos-label">
          <div className="eyebrow">L'Atelier</div>
          <div className="about-photos-rule" />
        </div>
        <div className="about-photo-row about-photo-row--alt">
          <div className="about-photo-frame apf-lg">
            <div className="about-photo-img" style={{ backgroundImage: "url('/uploads/WaveSpeed AI Image (2).png')" }} />
            <div className="about-photo-caption">
              <span className="apc-title">Atelier № 04</span>
              <span className="apc-sub">Plateau, Abidjan · Vue sur le marché</span>
            </div>
          </div>
          <div className="about-photo-stack">
            <div className="about-photo-frame apf-sm">
              <div className="about-photo-img" style={{ backgroundImage: "url('/assets/leather-black.png')", backgroundSize: "cover" }} />
              <div className="about-photo-caption">
                <span className="apc-title">La matière</span>
                <span className="apc-sub">Cuir pleine fleur · tanné végétal</span>
              </div>
            </div>
            <div className="about-photo-frame apf-sm">
              <div className="about-photo-img" style={{ backgroundImage: "url('/assets/leather-white.png')", backgroundSize: "cover" }} />
              <div className="about-photo-caption">
                <span className="apc-title">Cuir ivoire brut</span>
                <span className="apc-sub">Avant teinture · 18 mois d'affinage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisans */}
      <section className="about-photos-section">
        <div className="about-photos-label">
          <div className="eyebrow">Les Artisans</div>
          <div className="about-photos-rule" />
        </div>
        <div className="about-artisans-intro">
          <p className="about-body" style={{ maxWidth: "60ch" }}>Quatorze mains expertes. Chacun maîtrise une étape du cycle — du tracé au point sellier final. Certains sont là depuis l'ouverture de l'atelier en 2018.</p>
        </div>
        <div className="about-photo-row about-photo-row--3col">
          {[
            { img: "/uploads/WaveSpeed AI Image (3).png", name: "Souleymane K.", sub: "Maître sellier · 32 ans de métier" },
            { img: "/uploads/WaveSpeed AI Image (5).png", name: "Ibrahim D.", sub: "Tailleur · Spécialiste chaussure" },
            { img: "/uploads/AI Images Creation.png", name: "Mariam C.", sub: "Finitions & patine" },
          ].map(({ img, name, sub }) => (
            <div className="about-photo-frame apf-md" key={name}>
              <div className="about-photo-img" style={{ backgroundImage: `url('${img}')` }} />
              <div className="about-photo-caption">
                <span className="apc-title">{name}</span>
                <span className="apc-sub">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Processus */}
      <section className="about-photos-section">
        <div className="about-photos-label">
          <div className="eyebrow">Le Processus</div>
          <div className="about-photos-rule" />
        </div>
        <div className="about-process-grid">
          {[
            { num: "01", img: "/uploads/Image générée WaveSpeed AI (2).png", title: "Sélection du cuir", desc: "Chaque peau est choisie à la main. On écarte sans hésiter — seule la qualité parfaite passe." },
            { num: "02", img: "/uploads/AI Images from Text & Photo (1).png", title: "Tracé & découpe", desc: "Le gabarit est posé sur la peau. La lame suit les fibres, pas l'inverse." },
            { num: "03", img: "/uploads/Image générée WaveSpeed AI (2)-edc11dba.png", title: "Assemblage & point sellier", desc: "Deux aiguilles, un fil ciré. Le même geste depuis trois siècles." },
            { num: "04", img: "/uploads/WaveSpeed AI Image (2).png", title: "Finition & contrôle", desc: "Bords brûlés, cire appliquée, coutures vérifiées. La pièce sort quand elle est prête." },
          ].map(({ num, img, title, desc }) => (
            <div className="about-process-step" key={num}>
              <div className="about-photo-frame apf-process">
                <div className="about-photo-img" style={{ backgroundImage: `url('${img}')` }} />
              </div>
              <div className="about-process-meta">
                <div className="about-process-num">{num}</div>
                <div className="about-process-text">
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valeurs */}
      <section className="about-valeurs-section">
        <div className="section-head" style={{ marginBottom: 60 }}>
          <div className="num-large">/ Valeurs</div>
          <h2>Ce en quoi nous <em>croyons</em></h2>
          <div className="right">Trois principes</div>
        </div>
        <div className="about-valeurs">
          {[
            { num: "I", titre: <>La <em>lenteur</em> comme luxe</>, texte: "Une pièce Toss by Toss prend trois à cinq jours à fabriquer. Cette durée n'est pas un défaut — c'est la valeur même de l'objet." },
            { num: "II", titre: <>La <em>matière</em> d'abord</>, texte: "Nous n'utilisons que du cuir pleine fleur tanné végétal. Pas de cuir corrigé. Ce qui vieillit, embellit." },
            { num: "III", titre: <>L'<em>ancrage</em> local</>, texte: "De la peau au produit fini, tout se passe à Abidjan. Les artisans sont ivoiriens, les matières viennent du continent." },
          ].map(({ num, titre, texte }) => (
            <div className="about-valeur" key={num}>
              <div className="about-valeur-num">{num}</div>
              <h3>{titre}</h3>
              <p>{texte}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
