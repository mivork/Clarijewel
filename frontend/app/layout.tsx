import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Clarijewel | 在庫限りの高級宝石ECサイト",
  description: "厳選された宝石を、鑑定書付きで。3Dビューで細部までご確認いただけます。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
