"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminCareRequests,
  updateCareRequestStatus,
  type AdminCareRequest,
} from "@/lib/api";

const STATUS_LABEL: Record<AdminCareRequest["status"], string> = {
  requested: "依頼受付",
  in_progress: "対応中",
  completed: "完了",
};

const REQUEST_TYPE_LABEL: Record<AdminCareRequest["request_type"], string> = {
  cleaning: "無料クリーニング",
  resize: "サイズ直し",
};

function AdminCareRequestsContent() {
  const { token } = useAuth();
  const [careRequests, setCareRequests] = useState<AdminCareRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminCareRequests(token)
      .then(setCareRequests)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  }, [token]);

  const handleStatusChange = async (
    id: number,
    status: AdminCareRequest["status"]
  ) => {
    if (!token) return;
    try {
      const updated = await updateCareRequestStatus(token, id, status);
      setCareRequests((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {careRequests.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>依頼はありません。</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: 8 }}>依頼日</th>
                <th style={{ padding: 8 }}>種別</th>
                <th style={{ padding: 8 }}>商品</th>
                <th style={{ padding: 8 }}>お客様</th>
                <th style={{ padding: 8 }}>メモ</th>
                <th style={{ padding: 8 }}>状態</th>
              </tr>
            </thead>
            <tbody>
              {careRequests.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 8 }}>
                    {new Date(c.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td style={{ padding: 8 }}>{REQUEST_TYPE_LABEL[c.request_type]}</td>
                  <td style={{ padding: 8 }}>{c.product_name}</td>
                  <td style={{ padding: 8 }}>
                    {c.user.name}
                    <br />
                    <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                      {c.user.email}
                    </span>
                  </td>
                  <td style={{ padding: 8, maxWidth: 240 }}>{c.notes ?? "-"}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value as AdminCareRequest["status"])
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

export default function AdminCareRequestsPage() {
  return <AdminCareRequestsContent />;
}
