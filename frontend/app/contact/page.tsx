"use client";

import { useState, type FormEvent } from "react";
import { createInquiry, type InquiryCategory } from "@/lib/api";

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  general: "商品・ご注文について",
  product: "鑑定書・保証について",
  salon: "店舗・ご来店予約について",
  recruit: "採用について",
  other: "その他",
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<InquiryCategory>("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createInquiry({
        name,
        email,
        phone: phone || undefined,
        category,
        message,
      });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setCategory("general");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>お問い合わせ</h1>

      <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
        商品や店舗、ご購入に関するご相談は下記のフォームよりお送りください。よくある質問は
        <a href="/guide#faq"> ご購入ガイド</a>
        もあわせてご確認ください。折り返しのご連絡までお時間をいただく場合があります。
      </p>

      {sent ? (
        <p style={{ padding: 16, border: "1px solid var(--color-border)" }}>
          お問い合わせを受け付けました。ご入力いただいたメールアドレス宛にご連絡いたします。
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            電話番号(任意)
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            お問い合わせ種別
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InquiryCategory)}
            >
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            お問い合わせ内容
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: 10,
                color: "var(--color-text)",
              }}
            />
          </label>
          {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          <button type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
            {isSubmitting ? "送信中..." : "送信する"}
          </button>
        </form>
      )}
    </div>
  );
}
