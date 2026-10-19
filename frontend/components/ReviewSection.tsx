"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchReviews, postReview, type Review } from "@/lib/api";

export default function ReviewSection({ productId }: { productId: number }) {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reaction, setReaction] = useState<"good" | "bad">("good");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = () => {
    fetchReviews(productId)
      .then(setReviews)
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await postReview(token, productId, reaction, comment || null);
      setComment("");
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>レビュー</h2>

      {reviews.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>
          まだレビューがありません。
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {reviews.map((review) => (
            <li
              key={review.id}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius)",
                padding: 12,
              }}
            >
              <div>
                {review.reaction === "good" ? "高評価" : "低評価"} {review.user_name}
              </div>
              {review.comment && (
                <p style={{ margin: "4px 0 0" }}>{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
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
                name="reaction"
                checked={reaction === "good"}
                onChange={() => setReaction("good")}
              />
              良い
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="radio"
                name="reaction"
                checked={reaction === "bad"}
                onChange={() => setReaction("bad")}
              />
              良くない
            </label>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメント（任意）"
            rows={3}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 10,
              color: "var(--color-text)",
            }}
          />
          {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ alignSelf: "flex-start" }}
          >
            {isSubmitting ? "投稿中..." : "レビューを投稿"}
          </button>
        </form>
      ) : (
        <p style={{ marginTop: 16, color: "var(--color-muted)" }}>
          レビューを投稿するには <a href="/login">ログイン</a> してください。
        </p>
      )}
    </section>
  );
}
