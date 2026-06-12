/* Données de démonstration pour l'admin — actives tant que DATABASE_URL n'est pas configuré */

export const mockProducts = [
  { id: "1", name: "Sac Croco Noir",   ref: "TBT—01", category: "Maroquinerie", price: 285000, stock: 4,  imageUrl: "/assets/leather-black.png", imagePos: "center", active: true,  createdAt: new Date("2026-04-01"), updatedAt: new Date() },
  { id: "2", name: "Sandales Ivoire",  ref: "TBT—02", category: "Souliers",     price: 85000,  stock: 12, imageUrl: "/assets/leather-white.png", imagePos: "center", active: true,  createdAt: new Date("2026-04-03"), updatedAt: new Date() },
  { id: "3", name: "Derby Caramel",    ref: "TBT—03", category: "Souliers",     price: 165000, stock: 0,  imageUrl: "/assets/leather-black.png", imagePos: "center", active: true,  createdAt: new Date("2026-04-07"), updatedAt: new Date() },
  { id: "4", name: "Pochette Nude",    ref: "TBT—04", category: "Maroquinerie", price: 95000,  stock: 8,  imageUrl: "/assets/leather-white.png", imagePos: "center", active: true,  createdAt: new Date("2026-04-10"), updatedAt: new Date() },
  { id: "5", name: "Mule Dorée",       ref: "TBT—05", category: "Souliers",     price: 110000, stock: 3,  imageUrl: "/assets/leather-white.png", imagePos: "center", active: false, createdAt: new Date("2026-04-15"), updatedAt: new Date() },
  { id: "6", name: "Cartable Tabac",   ref: "TBT—06", category: "Maroquinerie", price: 320000, stock: 2,  imageUrl: "/assets/leather-black.png", imagePos: "center", active: true,  createdAt: new Date("2026-04-20"), updatedAt: new Date() },
];

export const mockOrders = [
  { ref: "TBT-A3F2K1", customerName: "Aminata Diallo",   customerEmail: "aminata@exemple.com", customerPhone: "+225 07 11 22 33", total: 285000, status: "PAID",      createdAt: new Date("2026-05-14"), items: [{ id: "1", qty: 1, unitPrice: 285000, product: { name: "Sac Croco Noir",  ref: "TBT—01" } }] },
  { ref: "TBT-B7G9M4", customerName: "Kofi Asante",      customerEmail: "kofi@exemple.com",    customerPhone: "+233 24 444 5555", total: 250000, status: "PENDING",   createdAt: new Date("2026-05-15"), items: [{ id: "2", qty: 1, unitPrice: 165000, product: { name: "Derby Caramel",   ref: "TBT—03" } }, { id: "3", qty: 1, unitPrice: 85000, product: { name: "Sandales Ivoire", ref: "TBT—02" } }] },
  { ref: "TBT-C1D4R8", customerName: "Fatoumata Bah",    customerEmail: "fato@exemple.com",    customerPhone: "+221 77 123 4567", total: 95000,  status: "SHIPPED",   createdAt: new Date("2026-05-13"), items: [{ id: "4", qty: 1, unitPrice: 95000,  product: { name: "Pochette Nude",   ref: "TBT—04" } }] },
  { ref: "TBT-E5H2N7", customerName: "Séraphin Manga",   customerEmail: "seraph@exemple.com",  customerPhone: "+33 6 12 34 56 78",total: 320000, status: "DELIVERED", createdAt: new Date("2026-05-10"), items: [{ id: "5", qty: 1, unitPrice: 320000, product: { name: "Cartable Tabac",  ref: "TBT—06" } }] },
  { ref: "TBT-F8J3P2", customerName: "Nadia Kourouma",   customerEmail: "nadia@exemple.com",   customerPhone: "+225 05 98 76 54", total: 110000, status: "CANCELLED", createdAt: new Date("2026-05-09"), items: [{ id: "6", qty: 1, unitPrice: 110000, product: { name: "Mule Dorée",      ref: "TBT—05" } }] },
  { ref: "TBT-G2K6Q9", customerName: "Ibrahim Dembélé",  customerEmail: "ibrahim@exemple.com", customerPhone: "+225 01 22 33 44", total: 170000, status: "PAID",      createdAt: new Date("2026-05-08"), items: [{ id: "7", qty: 2, unitPrice: 85000,  product: { name: "Sandales Ivoire", ref: "TBT—02" } }] },
];

export const mockSubscribers = [
  { email: "aminata@exemple.com",  source: "CHECKOUT",    active: true,  createdAt: new Date("2026-05-14") },
  { email: "kofi@exemple.com",     source: "CHECKOUT",    active: true,  createdAt: new Date("2026-05-15") },
  { email: "fato@exemple.com",     source: "NEWSLETTER",  active: true,  createdAt: new Date("2026-05-01") },
  { email: "seraph@exemple.com",   source: "CHECKOUT",    active: false, createdAt: new Date("2026-04-28") },
  { email: "nadia@exemple.com",    source: "NEWSLETTER",  active: true,  createdAt: new Date("2026-04-20") },
  { email: "mariam@exemple.com",   source: "NEWSLETTER",  active: true,  createdAt: new Date("2026-04-15") },
  { email: "ibrahim@exemple.com",  source: "CHECKOUT",    active: true,  createdAt: new Date("2026-05-08") },
];

export const mockAccountingEntries = [
  { id: "1", ref: "ACC-TBT-A3F2K1", type: "SALE" as const,   amount: 285000, createdAt: new Date("2026-05-14"), order: { customerName: "Aminata Diallo",  customerEmail: "aminata@exemple.com", ref: "TBT-A3F2K1" } },
  { id: "2", ref: "ACC-TBT-E5H2N7", type: "SALE" as const,   amount: 320000, createdAt: new Date("2026-05-10"), order: { customerName: "Séraphin Manga",  customerEmail: "seraph@exemple.com",  ref: "TBT-E5H2N7" } },
  { id: "3", ref: "ACC-TBT-G2K6Q9", type: "SALE" as const,   amount: 170000, createdAt: new Date("2026-05-08"), order: { customerName: "Ibrahim Dembélé", customerEmail: "ibrahim@exemple.com", ref: "TBT-G2K6Q9" } },
  { id: "4", ref: "REF-TBT-X1",     type: "REFUND" as const, amount: 95000,  createdAt: new Date("2026-05-05"), order: { customerName: "Nadia Kourouma",  customerEmail: "nadia@exemple.com",   ref: "TBT-F8J3P2" } },
  { id: "5", ref: "ACC-TBT-C1D4R8", type: "SALE" as const,   amount: 95000,  createdAt: new Date("2026-05-13"), order: { customerName: "Fatoumata Bah",   customerEmail: "fato@exemple.com",    ref: "TBT-C1D4R8" } },
];

export const mockRevenueByMonth = [
  { label: "déc. 25", amount: 180000 },
  { label: "jan. 26", amount: 420000 },
  { label: "fév. 26", amount: 310000 },
  { label: "mar. 26", amount: 695000 },
  { label: "avr. 26", amount: 520000 },
  { label: "mai 26",  amount: 870000 },
];

export const mockBestSellers = [
  { name: "Sac Croco Noir",  ref: "TBT—01", qty: 14 },
  { name: "Sandales Ivoire", ref: "TBT—02", qty: 11 },
  { name: "Derby Caramel",   ref: "TBT—03", qty: 9  },
  { name: "Cartable Tabac",  ref: "TBT—06", qty: 7  },
  { name: "Pochette Nude",   ref: "TBT—04", qty: 5  },
];

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.length > 0 && !url.includes("user:password") && !url.includes("ep-xxx");
}
