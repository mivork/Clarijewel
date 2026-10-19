"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const msg = await resetPassword(token, email, password, passwordConfirmation);
      setMessage(msg);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "パスワードの再設定に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="container" style={{ maxWidth: 420, padding: "48px 24px" }}>
        <p style={{ color: "var(--color-danger)" }}>
          無効なリンクです。もう一度「パスワードをお忘れの方」からやり直してください。
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 420, padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>新しいパスワードの設定</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          新しいパスワード（8文字以上）
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          新しいパスワード（確認）
          <input
            type="password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </label>
        {message && <p style={{ color: "var(--color-accent)" }}>{message}</p>}
        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "設定中..." : "パスワードを設定する"}
        </button>
      </form>
    </div>
  );
}
