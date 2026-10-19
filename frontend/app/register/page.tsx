"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      setError("利用規約・プライバシーポリシーへの同意が必要です。");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await register(name, email, password, marketingOptIn);
      setAuth(token, user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "会員登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>会員登録</h1>
      <p
        style={{
          border: "1px solid var(--color-border)",
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: "0.85rem",
          lineHeight: 1.8,
        }}
      >
        会員登録とメールアドレスの確認が完了すると、はじめてのご購入にお使いいただける
        <strong>10%の優待コード</strong>をメールでお届けします（発行から30日間・1回限り）。
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          お名前
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          パスワード（8文字以上）
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            <a href="/legal/terms" target="_blank" rel="noreferrer">
              利用規約
            </a>
            および
            <a href="/legal/privacy" target="_blank" rel="noreferrer">
              プライバシーポリシー
            </a>
            に同意します
          </span>
        </label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
          />
          <span>新作入荷・イベントなどのお知らせをメールで受け取る（任意）</span>
        </label>
        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting || !agreed}>
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </form>
      <p style={{ marginTop: 16, color: "var(--color-muted)" }}>
        すでにアカウントをお持ちの方は <a href="/login">ログイン</a>
      </p>
    </div>
  );
}
