import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import LogoReel from "@/components/LogoReel";

export const metadata: Metadata = {
  title: "Toss by Toss — L'art du cuir, fait à Abidjan",
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <Image
            className="hero-wordmark"
            src="/assets/wordmark.png"
            alt="Toss By Toss"
            width={1100}
            height={200}
            priority
          />
          <div className="tag">L'art du cuir. Fait à Abidjan.</div>
          <Link href="/marketplace" className="cta">
            <span>Découvrir la Collection</span>
            <span className="arrow">→</span>
          </Link>
        </div>
        <div className="hero-meta-bottom">
          <span>Maison fondée en mmxviii</span>
        </div>
      </section>

      {/* MOODBOARD SOUS LE HERO */}
      <section id="moodboard-landing">
        <div className="section-head">
          <div className="num-large">/ 01 — Vocabulaire</div>
          <h2>Le <em>Vocabulaire</em></h2>
          <div className="right">Six fragments d'atelier</div>
        </div>
        <div className="moodboard">
          <article className="mood-tile m1 dark">
            <div className="num">01</div>
            <div>
              <h3>L'<em>Artisan</em></h3>
              <p>Trente-deux ans à plier, tendre, coudre. La main qui sait avant que l'œil ne demande.</p>
            </div>
            <div className="meta">— Souleymane K., Maître sellier</div>
          </article>
          <article className="mood-tile m2">
            <div className="num">02</div>
            <h3>La <em>Matière</em></h3>
            <div className="meta">Cuir pleine fleur · tanné végétal · 18 mois d'affinage</div>
          </article>
          <article className="mood-tile m3">
            <div className="num">03</div>
            <h3>Le <em>Geste</em></h3>
            <p>Point sellier. Une aiguille de chaque côté, jamais une de plus.</p>
          </article>
          <article className="mood-tile m4 dark">
            <div className="num">04</div>
            <div>
              <h3><em>Abidjan</em></h3>
              <p>La moiteur du fleuve, la lumière dorée du soir, le claquement sec du marteau sur l'enclume — tout entre dans le cuir.</p>
            </div>
            <div className="meta">5°20′N · 4°02′O — Côte d'Ivoire</div>
          </article>
          <article className="mood-tile m5">
            <div className="num">05</div>
            <div>
              <h3>La <em>Femme</em></h3>
              <p>Elle marche vite. Elle sait pourquoi elle a choisi ceci, et pas autre chose.</p>
            </div>
          </article>
          <article className="mood-tile m6">
            <div className="num">06</div>
            <h3>L'<em>Héritage</em>, réécrit au présent.</h3>
            <div className="meta">Tradition × Modernité</div>
          </article>
        </div>
      </section>

      <LogoReel />
    </>
  );
}
