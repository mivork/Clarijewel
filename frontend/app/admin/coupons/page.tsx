"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
  type CouponInput,
} from "@/lib/api";

const emptyForm: CouponInput = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  max_uses: undefined,
  expires_at: "",
  active: true,
  public: false,
};

function AdminCouponsContent() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [form, setForm] = useState<CouponInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCoupons = (authToken: string) => {
    fetchAdminCoupons(authToken)
      .then(setCoupons)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  };

  useEffect(() => {
    if (token) loadCoupons(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (coupon: AdminCoupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_uses: coupon.max_uses ?? undefined,
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
      active: coupon.active,
      public: coupon.public,
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
      const input: CouponInput = {
        ...form,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      };

      if (editingId) {
        await updateAdminCoupon(token, editingId, input);
      } else {
        await createAdminCoupon(token, input);
      }

      resetForm();
      loadCoupons(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("このクーポンを削除しますか？")) return;

    try {
      await deleteAdminCoupon(token, id);
      loadCoupons(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
            <th style={{ padding: 8 }}>コード</th>
            <th style={{ padding: 8 }}>割引</th>
            <th style={{ padding: 8 }}>利用回数</th>
            <th style={{ padding: 8 }}>有効期限</th>
            <th style={{ padding: 8 }}>状態</th>
            <th style={{ padding: 8 }}>サイト公開</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: 8 }}>{c.code}</td>
              <td style={{ padding: 8 }}>
                {c.discount_type === "percentage"
                  ? `${c.discount_value}%`
                  : `¥${c.discount_value.toLocaleString()}`}
              </td>
              <td style={{ padding: 8 }}>
                {c.used_count} / {c.max_uses ?? "無制限"}
              </td>
              <td style={{ padding: 8 }}>
                {c.expires_at ? new Date(c.expires_at).toLocaleDateString("ja-JP") : "-"}
              </td>
              <td style={{ padding: 8 }}>{c.active ? "有効" : "無効"}</td>
              <td style={{ padding: 8 }}>{c.public ? "公開中" : "非公開"}</td>
              <td style={{ padding: 8, display: "flex", gap: 8 }}>
                <button type="button" onClick={() => startEdit(c)}>
                  編集
                </button>
                <button type="button" onClick={() => handleDelete(c.id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>
        {editingId ? "クーポンを編集" : "クーポンを新規登録"}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 640,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          クーポンコード
          <input
            type="text"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          割引方式
          <select
            value={form.discount_type}
            onChange={(e) =>
              setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })
            }
          >
            <option value="percentage">割引率(%)</option>
            <option value="fixed">定額割引(円)</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {form.discount_type === "percentage" ? "割引率（%）" : "割引額（円）"}
          <input
            type="number"
            required
            min={1}
            max={form.discount_type === "percentage" ? 100 : undefined}
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          最大利用回数（空欄で無制限）
          <input
            type="number"
            min={1}
            value={form.max_uses ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                max_uses: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          有効期限（空欄で無期限）
          <input
            type="date"
            value={form.expires_at ?? ""}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          有効にする
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.public}
            onChange={(e) => setForm({ ...form, public: e.target.checked })}
          />
          サイトに公開する（カートページに表示）
        </label>

        {error && (
          <p style={{ color: "var(--color-danger)", gridColumn: "1 / -1" }}>{error}</p>
        )}

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
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

export default function AdminCouponsPage() {
  return <AdminCouponsContent />;
}
