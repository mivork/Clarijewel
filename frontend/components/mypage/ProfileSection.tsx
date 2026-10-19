"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchProfile,
  updateProfile,
  resendVerificationEmail,
  type Profile,
} from "@/lib/api";

const RANK_LABEL: Record<string, string> = {
  normal: "通常会員",
  silver: "シルバー会員",
  gold: "ゴールド会員（VIP）",
};

export default function ProfileSection() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [birthday, setBirthday] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [preferredMetal, setPreferredMetal] = useState("");
  const [preferredSize, setPreferredSize] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchProfile(token).then((p) => {
      setProfile(p);
      setBirthday(p.birthday ?? "");
      setAnniversaryDate(p.anniversary_date ?? "");
      setPreferredMetal(p.preferred_metal ?? "");
      setPreferredSize(p.preferred_size ?? "");
    });
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await updateProfile(token, {
        birthday: birthday || null,
        anniversary_date: anniversaryDate || null,
        preferred_metal: preferredMetal || null,
        preferred_size: preferredSize || null,
      });
      setProfile(updated);
      setMessage("保存しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!token) return;
    setIsResending(true);
    setVerifyMessage(null);
    try {
      const msg = await resendVerificationEmail(token);
      setVerifyMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  if (!profile) return null;

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>プロフィール</h2>
      <p>
        会員ランク:{" "}
        <strong className="price">{RANK_LABEL[profile.rank]}</strong>
        （累計購入額 &yen;{profile.lifetime_spend.toLocaleString()}）
      </p>

      {!profile.email_verified && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius)",
            padding: 12,
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>
            メールアドレスがまだ確認されていません。登録時に届いたメールのリンクをクリックしてください。
          </span>
          <button type="button" disabled={isResending} onClick={handleResendVerification}>
            {isResending ? "送信中..." : "確認メールを再送信"}
          </button>
          {verifyMessage && (
            <span style={{ color: "var(--color-accent)" }}>{verifyMessage}</span>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 560,
          marginTop: 16,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          誕生日
          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          記念日
          <input
            type="date"
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          好みの地金
          <input
            type="text"
            placeholder="例: K18"
            value={preferredMetal}
            onChange={(e) => setPreferredMetal(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          好みのサイズ
          <input
            type="text"
            placeholder="例: 11号"
            value={preferredSize}
            onChange={(e) => setPreferredSize(e.target.value)}
          />
        </label>
        {message && <p style={{ color: "var(--color-accent)" }}>{message}</p>}
        <div>
          <button type="submit" disabled={isSaving}>
            {isSaving ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </section>
  );
}
