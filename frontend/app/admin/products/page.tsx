"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  createAdminAppraisal,
  uploadAdminMedia,
  type AdminProduct,
  type ProductInput,
  type StockStatus,
} from "@/lib/api";
import { ITEM_TYPES } from "@/lib/constants";

const emptyForm: ProductInput = {
  name: "",
  description: "",
  gem_type: "",
  category: "",
  metal_type: "",
  birthstone_month: undefined,
  weight_carat: undefined,
  price: 0,
  sku: "",
  stock_status: "available",
  thumbnail_path: "",
  model_3d_path: "",
  available_sizes: [],
  engravable: false,
  vip_only: false,
};

function AppraisalIssueForm({
  productId,
  token,
  onDone,
}: {
  productId: number;
  token: string;
  onDone: () => void;
}) {
  const [issuedBy, setIssuedBy] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createAdminAppraisal(token, productId, {
        issued_by: issuedBy || null,
        issued_at: issuedAt || null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "発行に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}
    >
      <input
        type="text"
        placeholder="鑑定機関名（未入力可）"
        value={issuedBy}
        onChange={(e) => setIssuedBy(e.target.value)}
      />
      <input
        type="date"
        value={issuedAt}
        onChange={(e) => setIssuedAt(e.target.value)}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "発行中..." : "PDFを自動生成して発行"}
      </button>
      {error && <span style={{ color: "var(--color-danger)" }}>{error}</span>}
    </form>
  );
}

function AdminProductsContent() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [sizesText, setSizesText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  const handleThumbnailUpload = async (file: File) => {
    if (!token) return;
    setIsUploadingThumbnail(true);
    setError(null);
    try {
      const { path } = await uploadAdminMedia(token, "thumbnail", file);
      setForm((prev) => ({ ...prev, thumbnail_path: path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "画像のアップロードに失敗しました");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleModelUpload = async (file: File) => {
    if (!token) return;
    setIsUploadingModel(true);
    setError(null);
    try {
      const { path } = await uploadAdminMedia(token, "model_3d", file);
      setForm((prev) => ({ ...prev, model_3d_path: path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "3Dモデルのアップロードに失敗しました");
    } finally {
      setIsUploadingModel(false);
    }
  };

  const loadProducts = (authToken: string) => {
    fetchAdminProducts(authToken)
      .then(setProducts)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  };

  useEffect(() => {
    if (token) {
      loadProducts(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setSizesText((product.available_sizes ?? []).join(", "));
    setForm({
      name: product.name,
      description: product.description ?? "",
      gem_type: product.gem_type ?? "",
      category: product.category ?? "",
      metal_type: product.metal_type ?? "",
      birthstone_month: product.birthstone_month ?? undefined,
      weight_carat: product.weight_carat ?? undefined,
      price: product.price,
      sku: product.sku,
      stock_status: product.stock_status,
      thumbnail_path: product.thumbnail_path ?? "",
      model_3d_path: product.model_3d_path ?? "",
      available_sizes: product.available_sizes ?? [],
      engravable: product.engravable,
      vip_only: product.vip_only,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setSizesText("");
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const input: ProductInput = {
        ...form,
        price: Number(form.price),
        weight_carat: form.weight_carat ? Number(form.weight_carat) : null,
        available_sizes: sizesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await updateAdminProduct(token, editingId, input);
      } else {
        await createAdminProduct(token, input);
      }

      resetForm();
      loadProducts(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("この商品を削除しますか？")) return;

    try {
      await deleteAdminProduct(token, id);
      loadProducts(token);
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
            <th style={{ padding: 8 }}>商品名</th>
            <th style={{ padding: 8 }}>カテゴリー</th>
            <th style={{ padding: 8 }}>価格</th>
            <th style={{ padding: 8 }}>在庫状態</th>
            <th style={{ padding: 8 }}>地金</th>
            <th style={{ padding: 8 }}>VIP限定</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <Fragment key={product.id}>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: 8 }}>{product.name}</td>
                <td style={{ padding: 8 }}>{product.category ?? "-"}</td>
                <td style={{ padding: 8 }}>
                  &yen;{product.price.toLocaleString()}
                </td>
                <td style={{ padding: 8 }}>{product.stock_status}</td>
                <td style={{ padding: 8 }}>{product.metal_type ?? "-"}</td>
                <td style={{ padding: 8 }}>{product.vip_only ? "限定" : "-"}</td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => startEdit(product)}>
                    編集
                  </button>
                  <button type="button" onClick={() => handleDelete(product.id)}>
                    削除
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIssuingId(issuingId === product.id ? null : product.id)
                    }
                  >
                    鑑定書発行
                  </button>
                </td>
              </tr>
              {issuingId === product.id && token && (
                <tr>
                  <td colSpan={6} style={{ padding: 8 }}>
                    <AppraisalIssueForm
                      productId={product.id}
                      token={token}
                      onDone={() => setIssuingId(null)}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>
        {editingId ? "商品を編集" : "商品を新規登録"}
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
          商品名
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          SKU
          <input
            type="text"
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          宝石種別
          <input
            type="text"
            value={form.gem_type ?? ""}
            onChange={(e) => setForm({ ...form, gem_type: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          カテゴリー（ジュエリー種別）
          <select
            value={form.category ?? ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">指定なし</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          地金
          <input
            type="text"
            placeholder="例: K18, Pt900"
            value={form.metal_type ?? ""}
            onChange={(e) => setForm({ ...form, metal_type: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          誕生石月
          <select
            value={form.birthstone_month ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                birthstone_month: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          >
            <option value="">指定なし</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          重量（カラット）
          <input
            type="number"
            step="0.01"
            value={form.weight_carat ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                weight_carat: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          価格（円）
          <input
            type="number"
            required
            min={0}
            value={form.price === 0 ? "" : form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })
            }
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          在庫状態
          <select
            value={form.stock_status}
            onChange={(e) =>
              setForm({ ...form, stock_status: e.target.value as StockStatus })
            }
          >
            <option value="available">available（販売中）</option>
            <option value="reserved">reserved（予約中）</option>
            <option value="sold">sold（売約済み）</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          対応サイズ（カンマ区切り）
          <input
            type="text"
            placeholder="例: 9号, 11号, 13号"
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.engravable ?? false}
            onChange={(e) => setForm({ ...form, engravable: e.target.checked })}
          />
          刻印可能
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.vip_only ?? false}
            onChange={(e) => setForm({ ...form, vip_only: e.target.checked })}
          />
          VIP会員限定（非公開商品）
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          サムネイル画像
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleThumbnailUpload(file);
            }}
          />
          {isUploadingThumbnail && <span>アップロード中...</span>}
          {form.thumbnail_path && (
            <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              登録済み: {form.thumbnail_path}
            </span>
          )}
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          3Dモデル（glb/gltf）
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleModelUpload(file);
            }}
          />
          {isUploadingModel && <span>アップロード中...</span>}
          {form.model_3d_path && (
            <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              登録済み: {form.model_3d_path}
            </span>
          )}
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            gridColumn: "1 / -1",
          }}
        >
          説明
          <textarea
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: 10,
              color: "var(--color-text)",
            }}
          />
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

export default function AdminProductsPage() {
  return <AdminProductsContent />;
}
