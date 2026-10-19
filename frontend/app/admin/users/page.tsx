"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminUsers,
  updateUserRank,
  suspendUser,
  unsuspendUser,
  type AdminUser,
  type UserRank,
} from "@/lib/api";

const rankLabel: Record<UserRank, string> = {
  normal: "通常",
  silver: "シルバー",
  gold: "ゴールド",
};

function AdminUsersContent() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = (authToken: string) => {
    fetchAdminUsers(authToken)
      .then(setUsers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  };

  useEffect(() => {
    if (token) loadUsers(token);
  }, [token]);

  const handleRankChange = async (userId: number, rank: UserRank) => {
    if (!token) return;
    try {
      const updated = await updateUserRank(token, userId, rank);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ランク更新に失敗しました");
    }
  };

  const handleToggleSuspend = async (targetUser: AdminUser) => {
    if (!token) return;
    const action = targetUser.is_suspended ? "解除" : "停止";
    if (!confirm(`このアカウントの利用を${action}しますか？`)) return;

    try {
      const updated = targetUser.is_suspended
        ? await unsuspendUser(token, targetUser.id)
        : await suspendUser(token, targetUser.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? updated : u))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "利用停止の変更に失敗しました"
      );
    }
  };

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
              <th style={{ padding: 8 }}>お名前</th>
              <th style={{ padding: 8 }}>メールアドレス</th>
              <th style={{ padding: 8 }}>ランク</th>
              <th style={{ padding: 8 }}>状態</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: 8 }}>
                  {u.name} {u.is_admin && "（管理者）"}
                </td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.rank}
                    onChange={(e) =>
                      handleRankChange(u.id, e.target.value as UserRank)
                    }
                  >
                    {Object.entries(rankLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  {u.is_suspended ? "利用停止中" : "有効"}
                </td>
                <td style={{ padding: 8 }}>
                  {u.id !== currentUser?.id && (
                    <button type="button" onClick={() => handleToggleSuspend(u)}>
                      {u.is_suspended ? "停止解除" : "利用停止"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
