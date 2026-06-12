export interface ProductColor {
  name: string;
  label: string;
  tex: string;
  hex: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  ref: string;
  cat: string;
  price: number;
  tex: string;
  pos: string;
  description: string;
  details: string[];
  colors: ProductColor[];
  images: string[];
  sizes?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 0,
    name: "Sac Croco Noir",
    slug: "sac-croco-noir",
    ref: "TBT—01",
    cat: "Maroquinerie",
    price: 285000,
    tex: "leather-black",
    pos: "30% 40%",
    description: "Un sac structuré taillé dans un cuir pleine fleur à grain croco. Sobre, massif, pensé pour durer une génération. La boucle en laiton bruni est le seul ornement — il n'en faut pas plus.",
    details: ["Cuir pleine fleur tanné végétal", "Grain croco estampé à chaud", "Doublure en percale de coton", "Fermeture boucle laiton bruni", "Dimensions : 32 × 24 × 12 cm"],
    colors: [
      { name: "noir",    label: "Noir",    tex: "leather-black", hex: "#1a1a1a" },
      { name: "ivoire",  label: "Ivoire",  tex: "leather-white", hex: "#e8e0d0" },
      { name: "caramel", label: "Caramel", tex: "leather-black",  hex: "#a0622a" },
    ],
    images: [
      "/assets/leather-black.png",
      "/uploads/WaveSpeed AI Image (2).png",
      "/uploads/Image générée WaveSpeed AI (2).png",
      "/uploads/AI Images from Text & Photo (1).png",
    ],
  },
  {
    id: 1,
    name: "Sandales Ivoire",
    slug: "sandales-ivoire",
    ref: "TBT—02",
    cat: "Souliers",
    price: 85000,
    tex: "leather-white",
    pos: "60% 30%",
    description: "Sandales à bride lacée, semelle cuir naturel. Le cuir ivoire est laissé brut, non teint — il prendra la patine de votre démarche. Chaque paire est unique.",
    details: ["Cuir pleine fleur naturel non teint", "Semelle cuir 4 mm", "Bride réglable, boucle acier", "Montage cousu main point sellier"],
    colors: [
      { name: "ivoire",  label: "Ivoire",  tex: "leather-white", hex: "#e8e0d0" },
      { name: "noir",    label: "Noir",    tex: "leather-black", hex: "#1a1a1a" },
      { name: "caramel", label: "Caramel", tex: "leather-black",  hex: "#a0622a" },
    ],
    images: [
      "/assets/leather-white.png",
      "/uploads/WaveSpeed AI Image (3).png",
      "/uploads/WaveSpeed AI Image (5).png",
      "/uploads/AI Images Creation.png",
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
  },
  {
    id: 2,
    name: "Derby Caramel",
    slug: "derby-caramel",
    ref: "TBT—03",
    cat: "Souliers",
    price: 165000,
    tex: "leather-black",
    pos: "70% 65%",
    description: "Derby à lacets en cuir caramel patiné à la main. Coupe anatomique, empeigne souple. Le vieillissement du cuir révèle progressivement les nuances ambrées de la teinture végétale.",
    details: ["Cuir veau pleine fleur caramel", "Patine végétale appliquée à la main", "Semelle cuir double épaisseur", "Couture Goodyear"],
    colors: [
      { name: "caramel",  label: "Caramel",  tex: "leather-black", hex: "#a0622a" },
      { name: "noir",     label: "Noir",     tex: "leather-black", hex: "#1a1a1a" },
      { name: "bordeaux", label: "Bordeaux", tex: "leather-black", hex: "#5c1a1a" },
    ],
    images: [
      "/assets/leather-black.png",
      "/uploads/WaveSpeed AI Image (5).png",
      "/uploads/AI Images from Text & Photo (1).png",
      "/uploads/Image générée WaveSpeed AI (2)-edc11dba.png",
    ],
    sizes: ["39", "40", "41", "42", "43", "44", "45", "46"],
  },
  {
    id: 3,
    name: "Pochette Nude",
    slug: "pochette-nude",
    ref: "TBT—04",
    cat: "Maroquinerie",
    price: 95000,
    tex: "leather-white",
    pos: "20% 70%",
    description: "Pochette envelope en cuir nude, à porter en main ou glissée sous le bras. La fermeture pression est invisible de face. Un objet minimaliste, au bord brûlé à la flamme.",
    details: ["Cuir agneau pleine fleur nude", "Fermeture pression dissimulée", "Bord brûlé et ciré à la flamme", "Poche intérieure plate", "Dimensions : 28 × 18 cm"],
    colors: [
      { name: "nude",    label: "Nude",    tex: "leather-white", hex: "#d4b8a0" },
      { name: "noir",    label: "Noir",    tex: "leather-black", hex: "#1a1a1a" },
      { name: "ivoire",  label: "Ivoire",  tex: "leather-white", hex: "#e8e0d0" },
    ],
    images: [
      "/assets/leather-white.png",
      "/uploads/AI Images Creation.png",
      "/uploads/WaveSpeed AI Image (2).png",
      "/uploads/Image générée WaveSpeed AI (2).png",
    ],
  },
  {
    id: 4,
    name: "Mule Dorée",
    slug: "mule-doree",
    ref: "TBT—05",
    cat: "Souliers",
    price: 110000,
    tex: "leather-white",
    pos: "50% 50%",
    description: "Mule à bout carré, empeigne façon vernis ivoire à reflets dorés. Semelle compensée 4 cm en liège recouvert de cuir. Légère, élégante, faite pour marcher vite.",
    details: ["Cuir verni ivoire à reflets dorés", "Semelle compensée liège + cuir", "Hauteur semelle : 4 cm", "Doublure cuir naturel"],
    colors: [
      { name: "dore",   label: "Ivoire doré", tex: "leather-white", hex: "#c9a84c" },
      { name: "noir",   label: "Noir",         tex: "leather-black", hex: "#1a1a1a" },
      { name: "nude",   label: "Nude",          tex: "leather-white", hex: "#d4b8a0" },
    ],
    images: [
      "/assets/leather-white.png",
      "/uploads/WaveSpeed AI Image (3).png",
      "/uploads/AI Images from Text & Photo (1).png",
      "/uploads/WaveSpeed AI Image (5).png",
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
  },
  {
    id: 5,
    name: "Cartable Tabac",
    slug: "cartable-tabac",
    ref: "TBT—06",
    cat: "Maroquinerie",
    price: 320000,
    tex: "leather-black",
    pos: "40% 25%",
    description: "Cartable deux soufflets en cuir tabac brun. Conçu pour porter l'essentiel — un ordinateur 15 pouces, des documents, une journée entière. La bandoulière est amovible et réglable.",
    details: ["Cuir pleine fleur tabac brun", "Deux soufflets, trois compartiments", "Compatible ordinateur 15 pouces", "Bandoulière amovible réglable", "Dimensions : 40 × 30 × 14 cm"],
    colors: [
      { name: "tabac",  label: "Tabac",  tex: "leather-black", hex: "#6b3f1f" },
      { name: "noir",   label: "Noir",   tex: "leather-black", hex: "#1a1a1a" },
      { name: "ivoire", label: "Ivoire", tex: "leather-white", hex: "#e8e0d0" },
    ],
    images: [
      "/assets/leather-black.png",
      "/uploads/Image générée WaveSpeed AI (2)-edc11dba.png",
      "/uploads/WaveSpeed AI Image (2).png",
      "/uploads/AI Images from Text & Photo (1).png",
    ],
  },
];

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " XOF";
}
