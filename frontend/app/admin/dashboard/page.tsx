"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminOrders,
  fetchInventorySummary,
  fetchSalesSummary,
  STOCK_STATUS_LABEL,
  type AdminOrder,
  type InventorySummary,
  type SalesSummaryItem,
} from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RECENT_ORDER_COUNT = 5;

// 注文の状態を、対応が必要かどうかが一目でわかるバッジに変換する
function orderBadge(order: AdminOrder): { label: string; tone: string } {
  if (order.status === "pending") return { label: "入金待ち", tone: "warning" };
  if (order.status === "failed") return { label: "決済失敗", tone: "danger" };
  if (order.status === "canceled") return { label: "キャンセル", tone: "" };
  return order.shipping_status === "shipped"
    ? { label: "発送済み", tone: "success" }
    : { label: "発送待ち", tone: "info" };
}

// 前月比（%）。前月が0件のときは比較できないのでnullを返す
function changeRate(current: number, previous: number | undefined): number | null {
  if (previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function StatCard({
  label,
  value,
  prefix,
  suffix,
  change,
  note,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number | null;
  note?: string;
}) {
  const hasChange = change !== undefined && change !== null;
  return (
    <div className="admin-card admin-stat">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">
        {prefix}
        {value.toLocaleString()}
        {suffix && <span style={{ fontSize: "1rem", marginLeft: 4 }}>{suffix}</span>}
      </div>
      {hasChange ? (
        <div className={`admin-stat-note ${change >= 0 ? "up" : "down"}`}>
          {change >= 0 ? "↑" : "↓"} 前月比 {change >= 0 ? "+" : ""}
          {change}%
        </div>
      ) : (
        note && <div className="admin-stat-note">{note}</div>
      )}
    </div>
  );
}

function AdminDashboardContent() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [sales, setSales] = useState<SalesSummaryItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetchInventorySummary(token),
      fetchSalesSummary(token),
      fetchAdminOrders(token),
    ])
      .then(([inv, sal, ord]) => {
        setInventory(inv);
        setSales(sal);
        setOrders(ord);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  }, [token]);

  const thisMonth = sales[sales.length - 1];
  const lastMonth = sales[sales.length - 2];
  const recentOrders = [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, RECENT_ORDER_COUNT);

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <div className="admin-stat-grid">
        {thisMonth && (
          <>
            <StatCard
              label={`今月の売上（${thisMonth.month}）`}
              value={thisMonth.total}
              prefix="¥"
              change={changeRate(thisMonth.total, lastMonth?.total)}
            />
            <StatCard
              label="今月の注文件数"
              value={thisMonth.order_count}
              suffix="件"
              change={changeRate(thisMonth.order_count, lastMonth?.order_count)}
            />
          </>
        )}
        {inventory && (
          <>
            <StatCard label="販売中の商品" value={inventory.available} suffix="点" />
            <StatCard
              label="予約中・売約済み"
              value={inventory.reserved + inventory.sold}
              suffix="点"
              note={`予約中 ${inventory.reserved} ／ 売約済み ${inventory.sold}`}
            />
          </>
        )}
      </div>

      <section className="admin-card admin-panel">
        <h2>最近の注文</h2>
        {recentOrders.length === 0 ? (
          <p style={{ color: "var(--color-muted)", margin: 0 }}>注文がありません。</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>注文ID</th>
                  <th>購入者</th>
                  <th>商品</th>
                  <th style={{ textAlign: "right" }}>金額</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const badge = orderBadge(order);
                  return (
                    <tr key={order.id}>
                      <td style={{ color: "var(--color-muted)" }}>#{order.id}</td>
                      <td>{order.user.name}</td>
                      <td>{order.items.map((item) => item.product.name).join(", ")}</td>
                      <td style={{ textAlign: "right" }}>
                        ¥{order.total_amount.toLocaleString()}
                      </td>
                      <td>
                        <span className={`admin-badge ${badge.tone}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <a
          href="/admin/orders"
          style={{ display: "inline-block", marginTop: 12, fontSize: "0.85rem" }}
        >
          注文管理を開く →
        </a>
      </section>

      <div className="admin-dashboard-row">
        <section className="admin-card admin-panel">
          <h2>月別売上（直近12ヶ月）</h2>
          <Bar
            data={{
              labels: sales.map((s) => s.month),
              datasets: [
                {
                  label: "売上（円）",
                  data: sales.map((s) => s.total),
                  backgroundColor: "rgba(77, 163, 255, 0.75)",
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { color: "#8ea3bf" },
                  grid: { color: "rgba(255, 255, 255, 0.06)" },
                },
                y: {
                  ticks: { color: "#8ea3bf" },
                  grid: { color: "rgba(255, 255, 255, 0.06)" },
                },
              },
            }}
          />
        </section>

        {inventory && (
          <section className="admin-card admin-panel">
            <h2>要チェックの在庫</h2>
            {inventory.needs_attention.length === 0 ? (
              <p style={{ color: "var(--color-muted)", margin: 0 }}>
                予約中・売約済みの商品はありません。
              </p>
            ) : (
              <table>
                <tbody>
                  {inventory.needs_attention.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.name}
                        <div style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>
                          {p.sku}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {p.stock_status !== "available" && (
                          <span
                            className={`admin-badge ${
                              p.stock_status === "reserved" ? "warning" : ""
                            }`}
                          >
                            {STOCK_STATUS_LABEL[p.stock_status]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
