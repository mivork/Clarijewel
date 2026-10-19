"use client";

import { useState, type FormEvent } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 16 }}>パスワード再設定</h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {message && <p style={{ color: "var(--color-accent)" }}>{message}</p>}
        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "送信する"}
        </button>
      </form>
      <p style={{ marginTop: 16, color: "var(--color-muted)" }}>
        <a href="/login">ログインページに戻る</a>
      </p>
    </div>
  );
}
