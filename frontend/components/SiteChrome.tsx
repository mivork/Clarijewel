"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import WelcomePopup from "@/components/WelcomePopup";
import { ITEM_TYPE_PATHS } from "@/lib/constants";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      />
    </svg>
  );
}

const FOOTER_COLUMNS: { heading: string; links: [string, string][] }[] = [
  {
    heading: "CATEGORY",
    links: [
      ["リング", ITEM_TYPE_PATHS.リング],
      ["ネックレス", ITEM_TYPE_PATHS.ネックレス],
      ["ピアス", ITEM_TYPE_PATHS.ピアス],
      ["イヤーカフ", ITEM_TYPE_PATHS.イヤーカフ],
      ["ブレスレット", ITEM_TYPE_PATHS.ブレスレット],
      ["ルース", ITEM_TYPE_PATHS.ルース],
    ],
  },
  {
    heading: "SALON",
    links: [
      ["銀座本店", "/#stores"],
      ["横浜サロン", "/#stores"],
      ["名古屋サロン", "/#stores"],
      ["大阪心斎橋サロン", "/#stores"],
      ["来店のご予約", "/reserve/visit"],
      ["オンラインのご予約", "/reserve/online"],
    ],
  },
  {
    heading: "ACCOUNT",
    links: [
      ["マイページ", "/mypage"],
      ["購入履歴", "/mypage#purchase"],
      ["お気に入り", "/mypage#wishlist"],
      ["カート", "/cart"],
      ["会員ランク", "/member"],
      ["新規登録", "/register"],
      ["ログイン", "/login"],
    ],
  },
  {
    heading: "GUIDE",
    links: [
      ["ご購入ガイド", "/guide"],
      ["お支払いについて", "/guide#payment"],
      ["配送・送料", "/guide#shipping"],
      ["返品・交換", "/guide#return"],
      ["アフターケア", "/guide#aftercare"],
      ["よくある質問", "/guide#faq"],
    ],
  },
  {
    heading: "CORPORATE",
    links: [
      ["zornix株式会社 企業情報", "/company"],
      ["特定商取引法に基づく表記", "/legal/no-return"],
      ["プライバシーポリシー", "/legal/privacy"],
      ["利用規約", "/legal/terms"],
      ["採用情報", "/recruit"],
      ["お問い合わせ", "/contact"],
      ["管理者ログイン", "/admin-login"],
    ],
  },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdmin && <Header />}
      <main>{children}</main>
      {!isAdmin && <WelcomePopup />}
      {!isAdmin && (
        <footer className="site-footer">
          <div className="container footer-top">
            <div className="footer-brand">
              <span className="logo">CLARIJEWEL</span>
              <span className="logo-tagline">TRANSPARENT GEMSTONE &amp; FINE JEWELRY</span>
              <div className="footer-sns">
                <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                  <InstagramIcon />
                </a>
                <a href="#" aria-label="X" onClick={(e) => e.preventDefault()}>
                  <XIcon />
                </a>
                <a href="#" aria-label="LINE" onClick={(e) => e.preventDefault()}>
                  <LineIcon />
                </a>
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.heading} className="footer-column">
                <h3>{column.heading}</h3>
                {column.links.map(([label, href]) => (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ))}
              </nav>
            ))}
          </div>

          <div className="container footer-bottom">
            <span>zornix Inc. | clarijewel Online Store</span>
            <span>&copy; {new Date().getFullYear()} CLARIJEWEL All Rights Reserved.</span>
          </div>
        </footer>
      )}
    </>
  );
}
