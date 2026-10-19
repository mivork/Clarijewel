"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createConsultation, fetchConsultations, type Consultation } from "@/lib/api";
import { STORE_NAMES } from "@/lib/constants";

export default function ConsultationSection() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [type, setType] = useState<"online" | "in_store">("online");
  const [store, setStore] = useState(STORE_NAMES[0]);
  const [datetime, setDatetime] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    fetchConsultations(token).then(setConsultations);
  };

  useEffect(load, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createConsultation(token, {
        type,
        store: type === "in_store" ? store : undefined,
        preferred_datetime: datetime,
        request_details: details || undefined,
        reference_image: image,
      });
      setDatetime("");
      setDetails("");
      setImage(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>専門家への相談予約</h2>

      {consultations.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {consultations.map((c) => (
            <li
              key={c.id}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius)",
                padding: 12,
              }}
            >
              <div>
                {c.type === "online" ? "オンライン相談" : `店舗相談（${c.store}）`} /{" "}
                {new Date(c.preferred_datetime).toLocaleString("ja-JP")}
                {c.priority && "（優先相談枠）"}
              </div>
              <div>状態: {c.status}</div>
              {c.meeting_url && (
                <div>
                  会議URL: <a href={c.meeting_url}>{c.meeting_url}</a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 480,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="radio"
              checked={type === "online"}
              onChange={() => setType("online")}
            />
            オンライン相談
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="radio"
              checked={type === "in_store"}
              onChange={() => setType("in_store")}
            />
            店舗相談
          </label>
        </div>
        {type === "in_store" && (
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            ご来店店舗
            <select value={store} onChange={(e) => setStore(e.target.value)}>
              {STORE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          希望日時
          <input
            type="datetime-local"
            required
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          事前ヒアリング（ご要望など）
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 10,
              color: "var(--color-text)",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          参考画像（任意）
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-start" }}>
          {isSubmitting ? "予約中..." : "予約する"}
        </button>
      </form>
    </section>
  );
}
