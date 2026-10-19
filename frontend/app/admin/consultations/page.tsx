"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminConsultations,
  updateConsultationStatus,
  type AdminConsultation,
  type Consultation,
} from "@/lib/api";

const STATUS_LABEL: Record<Consultation["status"], string> = {
  pending: "未確認",
  confirmed: "確定",
  completed: "完了",
  canceled: "キャンセル",
};

function AdminConsultationsContent() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminConsultations(token)
      .then(setConsultations)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  }, [token]);

  const handleStatusChange = async (id: number, status: Consultation["status"]) => {
    if (!token) return;
    try {
      const updated = await updateConsultationStatus(token, id, status);
      setConsultations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {consultations.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>相談予約はありません。</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: 8 }}>希望日時</th>
                <th style={{ padding: 8 }}>種別</th>
                <th style={{ padding: 8 }}>お客様</th>
                <th style={{ padding: 8 }}>要望</th>
                <th style={{ padding: 8 }}>優先</th>
                <th style={{ padding: 8 }}>状態</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: 8 }}>
                    {new Date(c.preferred_datetime).toLocaleString("ja-JP")}
                  </td>
                  <td style={{ padding: 8 }}>
                    {c.type === "online" ? "オンライン" : `店舗（${c.store}）`}
                  </td>
                  <td style={{ padding: 8 }}>
                    {c.user.name}
                    <br />
                    <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                      {c.user.email}
                    </span>
                  </td>
                  <td style={{ padding: 8, maxWidth: 240 }}>
                    {c.request_details ?? "-"}
                  </td>
                  <td style={{ padding: 8 }}>{c.priority ? "優先" : "-"}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value as Consultation["status"])
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

export default function AdminConsultationsPage() {
  return <AdminConsultationsContent />;
}
