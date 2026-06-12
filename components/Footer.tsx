import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-mark">
            <Image src="/assets/wordmark.png" alt="Toss by Toss" width={800} height={200} className="footer-wordmark" />
          </div>
          <div className="footer-sub">L'art du cuir, fait à Abidjan.<br />— Angré 8e tranche star 11 face au collège sainte camille<br />— Bietry Boulevard de Marseille non loin du rooftop abidjan</div>
        </div>
        <div className="footer-nav">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/moodboard">Moodboard</Link>
          <Link href="/about">À propos</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/marketplace">Boutique</Link>
          <Link href="/contact">Sur mesure</Link>
        </div>
        <div className="footer-socials">
          <a href="#"><span className="handle">@tossbytoss</span><span>Instagram</span></a>
          <a href="#"><span className="handle">+225 07 ··</span><span>WhatsApp</span></a>
          <a href="#"><span className="handle">@tossbytoss</span><span>TikTok</span></a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Toss by Toss · Abidjan, Côte d'Ivoire · Tous droits réservés</span>
        <span>Made with patience &amp; leather</span>
      </div>
      <div className="footer-credit">Propulsé par Xcompany 2026</div>
    </footer>
  );
}
