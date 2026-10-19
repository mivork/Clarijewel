"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { logout as logoutRequest } from "@/lib/api";
import AdminNav, { ADMIN_LINKS } from "@/components/AdminNav";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 14a8 8 0 0 1-6.2-2.9C7 15.3 9.4 14.5 12 14.5s5 .8 6.2 2.6A8 8 0 0 1 12 20Z" />
    </svg>
  );
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, token, isLoading, clearAuth } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (token) {
      await logoutRequest(token).catch(() => {});
    }
    clearAuth();
  };

  if (isLoading) {
    return (
      <div className="admin-shell" style={{ padding: 48 }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-shell" style={{ padding: 48 }}>
        <p>
          管理者ページを利用するには <a href="/admin-login">ログイン</a>{" "}
          してください。
        </p>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="admin-shell" style={{ padding: 48 }}>
        <p>このページを利用する権限がありません。</p>
        <p>
          <a href="/admin-login">管理者アカウントでログインし直す</a>
        </p>
      </div>
    );
  }

  const pageTitle =
    ADMIN_LINKS.find((link) => pathname === link.href)?.label ?? "管理画面";

  return (
    <div className="admin-shell admin-layout">
      <AdminNav />
      <div className="admin-main">
        <header className="admin-topbar admin-card">
          <h1 className="admin-topbar-title">{pageTitle}</h1>
          <div className="admin-topbar-user">
            <UserIcon />
            <span>{user.name}（管理者）</span>
            <button type="button" className="admin-button-ghost" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </header>
        {/* ダッシュボードは複数のカードを自前で並べるため、それ以外のページだけ1枚のカードで包む */}
        <main
          className={
            pathname === "/admin/dashboard" ? "admin-dashboard" : "admin-card admin-panel"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
