import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const products = [
  {
    name: "Sac Toundra",
    ref: "TBT-001",
    slug: "sac-toundra",
    category: "Sac",
    price: 185000,
    stock: 3,
    imageUrl: "",
    imagePos: "center",
    texKey: "leather-cognac",
    description: "Cuir pleine fleur tanné végétal, confectionné à Abidjan. Chaque pièce porte l'empreinte de la main qui l'a façonnée.",
    details: [
      "Cuir pleine fleur 100% végétal",
      "Fermeture laiton brossé",
      "Doublure en daim naturel",
      "Dimensions : 38 × 28 × 12 cm",
      "Fabrication artisanale, Abidjan",
    ],
    colors: [
      { name: "cognac", label: "Cognac", tex: "leather-cognac", hex: "#a0522d" },
      { name: "noir", label: "Noir Ébène", tex: "leather-black", hex: "#1a1a1a" },
    ],
    sizes: [],
    active: true,
  },
  {
    name: "Ceinture Sahel",
    ref: "TBT-002",
    slug: "ceinture-sahel",
    category: "Ceinture",
    price: 45000,
    stock: 8,
    imageUrl: "",
    imagePos: "center",
    texKey: "leather-dark-brown",
    description: "Ceinture en cuir pleine fleur, boucle en laiton forgé. Intemporelle, elle s'améliore avec le temps.",
    details: [
      "Cuir pleine fleur végétal",
      "Boucle en laiton forgé",
      "Largeur : 3,5 cm",
      "Longueur ajustable : 85–115 cm",
    ],
    colors: [
      { name: "brun", label: "Brun Foncé", tex: "leather-dark-brown", hex: "#3b1f0e" },
      { name: "noir", label: "Noir Ébène", tex: "leather-black", hex: "#1a1a1a" },
    ],
    sizes: [],
    active: true,
  },
  {
    name: "Portefeuille Lagunaire",
    ref: "TBT-003",
    slug: "portefeuille-lagunaire",
    category: "Maroquinerie",
    price: 38000,
    stock: 12,
    imageUrl: "",
    imagePos: "center",
    texKey: "leather-navy",
    description: "Portefeuille plat en cuir vachette patiné. Compact et élégant, conçu pour durer.",
    details: [
      "Cuir vachette patiné",
      "8 emplacements cartes",
      "1 compartiment billets",
      "Dimensions : 12 × 9 cm",
    ],
    colors: [
      { name: "marine", label: "Marine Profond", tex: "leather-navy", hex: "#1a2744" },
      { name: "cognac", label: "Cognac", tex: "leather-cognac", hex: "#a0522d" },
    ],
    sizes: [],
    active: true,
  },
  {
    name: "Soulier Plateau",
    ref: "TBT-004",
    slug: "soulier-plateau",
    category: "Soulier",
    price: 120000,
    stock: 2,
    imageUrl: "",
    imagePos: "top",
    texKey: "leather-burgundy",
    description: "Derby artisanal en cuir de veau. Semelle en cuir cousue à la main, chaque paire est numérotée.",
    details: [
      "Cuir de veau pleine fleur",
      "Semelle cuir cousue Goodyear",
      "Chaque paire numérotée",
      "Fabrication artisanale, Abidjan",
    ],
    colors: [
      { name: "bordeaux", label: "Bordeaux", tex: "leather-burgundy", hex: "#6b1a2a" },
      { name: "noir", label: "Noir Ébène", tex: "leather-black", hex: "#1a1a1a" },
    ],
    sizes: ["39", "40", "41", "42", "43", "44"],
    active: true,
  },
  {
    name: "Pochette Harmattan",
    ref: "TBT-005",
    slug: "pochette-harmattan",
    category: "Sac",
    price: 65000,
    stock: 5,
    imageUrl: "",
    imagePos: "center",
    texKey: "leather-natural",
    description: "Pochette en cuir naturel non teint. La patine évolue avec le temps, unique à son propriétaire.",
    details: [
      "Cuir naturel non teint",
      "Fermeture glissière YKK laiton",
      "Lanière amovible en cuir",
      "Dimensions : 26 × 18 cm",
    ],
    colors: [
      { name: "naturel", label: "Naturel", tex: "leather-natural", hex: "#c8a97e" },
    ],
    sizes: [],
    active: true,
  },
  {
    name: "Porte-Documents Abidjan",
    ref: "TBT-006",
    slug: "porte-documents-abidjan",
    category: "Sac",
    price: 210000,
    stock: 1,
    imageUrl: "",
    imagePos: "center",
    texKey: "leather-black",
    description: "Porte-documents en cuir de buffle, format A4. La pièce maîtresse de notre collection.",
    details: [
      "Cuir de buffle tanné végétal",
      "Format A4, épaisseur 4 cm",
      "3 compartiments + porte-stylo",
      "Poignée et bandoulière cuir",
      "Pièce numérotée, édition limitée",
    ],
    colors: [
      { name: "noir", label: "Noir Ébène", tex: "leather-black", hex: "#1a1a1a" },
      { name: "brun", label: "Brun Foncé", tex: "leather-dark-brown", hex: "#3b1f0e" },
    ],
    sizes: [],
    active: true,
  },
];

async function main() {
  console.log("Seeding products…");
  for (const p of products) {
    await db.product.upsert({
      where: { ref: p.ref },
      update: {},
      create: p,
    });
    console.log(`  ✓ ${p.ref} — ${p.name}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
