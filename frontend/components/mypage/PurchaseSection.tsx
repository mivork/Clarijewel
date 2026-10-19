"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchMyPagePurchases,
  createCareRequest,
  downloadAppraisalPdf,
  downloadReceiptPdf,
  cancelOrder,
  type Purchase,
} from "@/lib/api";

const CARE_REQUEST_STATUS_LABEL: Record<string, string> = {
  requested: "依頼受付",
  in_progress: "対応中",
  completed: "完了",
};

function CareRequestButtons({
  warrantyId,
  isExpired,
  token,
  onDone,
}: {
  warrantyId: number;
  isExpired: boolean;
  token: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const request = async (type: "cleaning" | "resize") => {
    setBusy(true);
    try {
      await createCareRequest(token, warrantyId, type);
      onDone();
    } finally {
      setBusy(false);
    }
  };

  if (isExpired) {
    return <span style={{ color: "var(--color-muted)" }}>保証期間終了</span>;
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button type="button" disabled={busy} onClick={() => request("cleaning")}>
        無料クリーニング依頼
      </button>
      <button type="button" disabled={busy} onClick={() => request("resize")}>
        サイズ直し依頼
      </button>
    </div>
  );
}

export default function PurchaseSection() {
  const { token } = useAuth();
  const [totalValue, setTotalValue] = useState(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    fetchMyPagePurchases(token).then((res) => {
      setTotalValue(res.total_estimated_value);
      setPurchases(res.purchases);
    });
  };

  useEffect(load, [token]);

  const handleCancelOrder = async (orderId: number) => {
    if (!token) return;
    if (!confirm("この注文をキャンセルしますか？全額返金されます。")) return;

    setCancelingOrderId(orderId);
    setError(null);
    try {
      await cancelOrder(token, orderId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "キャンセルに失敗しました");
    } finally {
      setCancelingOrderId(null);
    }
  };

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>
        購入履歴・鑑定書ガレージ・資産評価
      </h2>
      <p>
        推定資産評価額合計:{" "}
        <strong className="price">&yen;{totalValue.toLocaleString()}</strong>
      </p>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {purchases.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>まだ購入履歴がありません。</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
          }}
        >
          {purchases.map((p) => (
            <li
              key={p.order_item_id}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius)",
                padding: 16,
                display: "flex",
                gap: 16,
              }}
            >
              {p.product.thumbnail_url && (
                <img
                  src={p.product.thumbnail_url}
                  alt={p.product.name}
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div>{p.product.name}</div>
                <div className="price">&yen;{p.price.toLocaleString()}</div>
                {p.selected_size && <div>サイズ: {p.selected_size}</div>}
                {p.engraving_text && <div>刻印: {p.engraving_text}</div>}

                {token && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() =>
                        downloadReceiptPdf(token, p.order_id, `receipt_${p.order_id}.pdf`)
                      }
                    >
                      領収書PDFをダウンロード
                    </button>
                    {p.shipping_status === "not_shipped" && (
                      <button
                        type="button"
                        disabled={cancelingOrderId === p.order_id}
                        onClick={() => handleCancelOrder(p.order_id)}
                      >
                        {cancelingOrderId === p.order_id ? "処理中..." : "注文をキャンセルする"}
                      </button>
                    )}
                  </div>
                )}

                {p.appraisal && (
                  <div style={{ marginTop: 8 }}>
                    <div>鑑定書番号: {p.appraisal.serial_number}</div>
                    {token && (
                      <button
                        type="button"
                        style={{ marginTop: 4 }}
                        onClick={() =>
                          downloadAppraisalPdf(
                            token,
                            p.appraisal!.id,
                            `appraisal_${p.appraisal!.serial_number}.pdf`
                          )
                        }
                      >
                        鑑定書PDFをダウンロード
                      </button>
                    )}
                  </div>
                )}

                {p.warranty && (
                  <div style={{ marginTop: 8 }}>
                    <div>
                      保証期限:{" "}
                      {new Date(p.warranty.expires_at).toLocaleDateString("ja-JP")}
                      {p.warranty.is_expired && "（期限切れ）"}
                    </div>
                    {p.warranty.care_requests.length > 0 && (
                      <ul style={{ margin: "4px 0", paddingLeft: 16 }}>
                        {p.warranty.care_requests.map((c) => (
                          <li key={c.id} style={{ fontSize: "0.85rem" }}>
                            {c.request_type === "cleaning" ? "クリーニング" : "サイズ直し"}
                            : {CARE_REQUEST_STATUS_LABEL[c.status] ?? c.status}
                          </li>
                        ))}
                      </ul>
                    )}
                    {token && (
                      <div style={{ marginTop: 4 }}>
                        <CareRequestButtons
                          warrantyId={p.warranty.id}
                          isExpired={p.warranty.is_expired}
                          token={token}
                          onDone={load}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
