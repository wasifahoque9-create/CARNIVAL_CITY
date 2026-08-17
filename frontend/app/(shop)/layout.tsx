import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}