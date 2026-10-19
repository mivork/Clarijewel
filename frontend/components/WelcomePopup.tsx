"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

// 閉じた後、同じ人に再表示しない期間
const SNOOZE_DAYS = 30;
// 「見てもらっている」と判断するまでの待ち時間とスクロール量
const SHOW_AFTER_MS = 30_000;
const SHOW_AFTER_SCROLL_RATIO = 0.5;
const STORAGE_KEY = "clarijewel_welcome_popup_hidden_until";

// 登録・購入の手続き中に割り込まないよう、これらのページでは表示しない
const EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/register",
  "/login",
  "/cart",
  "/checkout",
  "/forgot-password",
  "/reset-password",
  "/email-verified",
  "/legal",
];

function isSnoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
    );
  } catch {
    // ストレージが使えない環境では、そのページ表示中だけ閉じた状態になる
  }
}

export default function WelcomePopup() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isExcludedPage = EXCLUDED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const eligible = !isLoading && !user && !isExcludedPage;

  useEffect(() => {
    if (!eligible || isSnoozed()) return;

    const show = () => {
      if (!isSnoozed()) setOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SHOW_AFTER_SCROLL_RATIO) {
        show();
      }
    };

    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, [eligible]);

  // ログインした・対象外のページへ移動した場合は表示しない
  const visible = open && eligible;

  useEffect(() => {
    if (!visible) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        snooze();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const handleClose = () => {
    snooze();
    setOpen(false);
  };

  if (!visible) return null;

  return (
    <div className="welcome-popup-backdrop" onClick={handleClose}>
      <div
        className="welcome-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="welcome-popup-close"
          aria-label="閉じる"
          onClick={handleClose}
        >
          ×
        </button>
        <div className="welcome-popup-image" aria-hidden="true" />
        <div className="welcome-popup-body">
          <p className="welcome-popup-eyebrow">MEMBERS PRIVILEGE</p>
          <h2 id="welcome-popup-title">
            はじめてのご購入に、
            <br />
            10%の優待をご用意しています
          </h2>
          <p className="welcome-popup-text">
            会員登録とメールアドレスの確認が完了すると、はじめてのご購入にお使いいただける優待コードをお届けします。
          </p>
          <a href="/register?from=welcome" className="welcome-popup-cta" onClick={snooze}>
            会員登録へ進む
          </a>
          <p className="welcome-popup-note">
            ※優待コードの有効期限は発行から30日間、1回限りです。
          </p>
        </div>
      </div>
    </div>
  );
}
