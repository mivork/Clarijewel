"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminInquiries,
  updateInquiryStatus,
  type AdminInquiry,
  type InquiryCategory,
} from "@/lib/api";

const STATUS_LABEL: Record<AdminInquiry["status"], string> = {
  unread: "未対応",
  read: "対応済み",
};

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  general: "商品・ご注文について",
  product: "鑑定書・保証について",
  salon: "店舗・ご来店予約について",
  recruit: "採用について",
  other: "その他",
};

function AdminInquiriesContent() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminInquiries(token)
      .then(setInquiries)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  }, [token]);

  const handleStatusChange = async (id: number, status: AdminInquiry["status"]) => {
    if (!token) return;
    try {
      const updated = await updateInquiryStatus(token, id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {inquiries.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>お問い合わせはありません。</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: 8 }}>受信日</th>
                <th style={{ padding: 8 }}>種別</th>
                <th style={{ padding: 8 }}>お客様</th>
                <th style={{ padding: 8 }}>内容</th>
                <th style={{ padding: 8 }}>状態</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {new Date(i.created_at).toLocaleString("ja-JP")}
                  </td>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {CATEGORY_LABEL[i.category]}
                  </td>
                  <td style={{ padding: 8 }}>
                    {i.name}
                    <br />
                    <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                      {i.email}
                      {i.phone && ` / ${i.phone}`}
                    </span>
                  </td>
                  <td style={{ padding: 8, maxWidth: 360, whiteSpace: "pre-wrap" }}>
                    {i.message}
                  </td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={i.status}
                      onChange={(e) =>
                        handleStatusChange(i.id, e.target.value as AdminInquiry["status"])
                      }
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminInquiriesPage() {
  return <AdminInquiriesContent />;
}
