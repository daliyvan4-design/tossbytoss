import { CartProvider } from "@/contexts/CartContext";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="tex day" />
      <div className="tex night" />
      <div className="vignette" />
      <Nav />
      <CartDrawer />
      {children}
      <Footer />
    </CartProvider>
  );
}
