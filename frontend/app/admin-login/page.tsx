"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await login(email, password);

      if (!user.is_admin) {
        await logout(token).catch(() => {});
        setError("管理者権限のあるアカウントでログインしてください。");
        return;
      }

      setAuth(token, user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-shell" style={{ minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 420, padding: "80px 24px" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>管理者ログイン</h1>
        <p style={{ color: "var(--color-muted)", marginBottom: 24, fontSize: "0.9rem" }}>
          Clarijewel管理画面には、管理者権限のあるアカウントのみログインできます。
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
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            パスワード
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
