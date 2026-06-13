export interface ProductColor {
  name: string;
  label: string;
  tex: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  ref: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string;
  imagePos: string;
  texKey: string;
  description: string;
  details: string[];
  colors: ProductColor[];
  sizes: string[];
}

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " XOF";
}
