"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { logout as logoutRequest } from "@/lib/api";
import { ITEM_TYPES, ITEM_TYPE_PATHS } from "@/lib/constants";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M8 12h8M11 18h2" />
    </svg>
  );
}

export default function Header() {
  const { user, token, isLoading, clearAuth } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams?.get("q") ?? "");

  const handleLogout = async () => {
    if (token) {
      await logoutRequest(token).catch(() => {});
    }
    clearAuth();
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="site-header">
      <div className="container utility-bar">
        <span className="utility-text">
          zornix株式会社 直営オンラインストア　|　透明性と信頼を届けるジュエリーブランド
        </span>
        <nav className="utility-links">
          <a href="/mypage#consultation">オンライン・実店舗相談</a>
          <a href="/guide">ご購入ガイド</a>
        </nav>
      </div>

      <div className="container header-main">
        <a href="/" className="logo-block">
          <span className="logo">CLARIJEWEL</span>
          <span className="logo-tagline">TRANSPARENT GEMSTONE &amp; FINE JEWELRY</span>
        </a>

        <form className="header-search" role="search" onSubmit={handleSearch}>
          <a href="/#search" className="header-search-filter" title="条件指定">
            <FilterIcon />
            <span>条件指定</span>
          </a>
          <input
            type="text"
            name="q"
            placeholder="商品名、宝石の種類、シリアルナンバー..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="検索">
            <SearchIcon />
          </button>
        </form>

        <nav className="header-actions">
          <a
            href="/mypage#wishlist"
            className="header-icon-link"
            aria-label="お気に入り"
            title="お気に入り"
          >
            <HeartIcon />
            <span>お気に入り</span>
          </a>
          <a href="/cart" className="header-icon-link" aria-label="カート" title="カート">
            <CartIcon />
            <span>カート</span>
            {items.length > 0 && (
              <span className="header-icon-badge">{items.length}</span>
            )}
          </a>
          <a
            href="/mypage"
            className="header-icon-link"
            aria-label="マイページ"
            title="マイページ"
          >
            <UserIcon />
            <span>マイページ</span>
          </a>
          {!isLoading && user && (
            <span className="header-account">
              <span className="header-account-name">{user.name} 様</span>
              <button type="button" onClick={handleLogout}>
                ログアウト
              </button>
            </span>
          )}
          {!isLoading && !user && (
            <span className="header-account">
              <a href="/register">新規登録</a>
              <a href="/login">ログイン</a>
            </span>
          )}
        </nav>
      </div>

      <div className="container header-nav-row">
        <nav className="header-nav-primary">
          <a href="/">
            <HomeIcon />
            ホーム
          </a>
          <a href="/">人気ランキング</a>
          <a href="/#new-arrivals">新着アイテム</a>
          <a href="/#search">条件から探す</a>
        </nav>
        <nav className="header-nav-categories">
          <span className="header-nav-categories-label">カテゴリー：</span>
          {ITEM_TYPES.map((c) => (
            <a key={c} href={ITEM_TYPE_PATHS[c]}>
              {c}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
