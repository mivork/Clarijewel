"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminNewsArticles,
  createAdminNewsArticle,
  updateAdminNewsArticle,
  deleteAdminNewsArticle,
  type AdminNewsArticle,
  type NewsArticleInput,
} from "@/lib/api";

const emptyForm: NewsArticleInput = {
  title: "",
  body: "",
  published_at: "",
};

// datetime-local入力用に "YYYY-MM-DDTHH:mm" 形式へ変換
function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AdminNewsContent() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<AdminNewsArticle[]>([]);
  const [form, setForm] = useState<NewsArticleInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadArticles = (authToken: string) => {
    fetchAdminNewsArticles(authToken)
      .then(setArticles)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  };

  useEffect(() => {
    if (token) {
      loadArticles(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (article: AdminNewsArticle) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      body: article.body,
      published_at: toDatetimeLocal(article.published_at),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const input: NewsArticleInput = {
        ...form,
        published_at: form.published_at ? form.published_at : null,
      };

      if (editingId) {
        await updateAdminNewsArticle(token, editingId, input);
      } else {
        await createAdminNewsArticle(token, input);
      }

      resetForm();
      loadArticles(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("このニュース記事を削除しますか？")) return;

    try {
      await deleteAdminNewsArticle(token, id);
      loadArticles(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
            <th style={{ padding: 8 }}>タイトル</th>
            <th style={{ padding: 8 }}>公開日時</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: 8 }}>{article.title}</td>
              <td style={{ padding: 8 }}>
                {article.published_at
                  ? new Date(article.published_at).toLocaleString("ja-JP")
                  : "-"}
              </td>
              <td style={{ padding: 8, display: "flex", gap: 8 }}>
                <button type="button" onClick={() => startEdit(article)}>
                  編集
                </button>
                <button type="button" onClick={() => handleDelete(article.id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>
        {editingId ? "ニュース記事を編集" : "ニュース記事を新規登録"}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 640,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          タイトル
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          公開日時（未入力の場合は現在時刻）
          <input
            type="datetime-local"
            value={form.published_at ?? ""}
            onChange={(e) => setForm({ ...form, published_at: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          本文
          <textarea
            rows={6}
            required
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
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

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : editingId ? "更新する" : "登録する"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              キャンセル
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default function AdminNewsPage() {
  return <AdminNewsContent />;
}
