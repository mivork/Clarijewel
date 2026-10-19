"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchAdminOrders,
  updateOrderShipping,
  type AdminOrder,
  type ShippingStatus,
} from "@/lib/api";

function OrderRow({
  order,
  token,
  onUpdated,
}: {
  order: AdminOrder;
  token: string;
  onUpdated: (order: AdminOrder) => void;
}) {
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>(
    order.shipping_status
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateOrderShipping(
        token,
        order.id,
        shippingStatus,
        trackingNumber || null
      );
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <td style={{ padding: 8 }}>{order.id}</td>
      <td style={{ padding: 8 }}>
        {order.user.name}
        <br />
        <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
          {order.user.email}
        </span>
      </td>
      <td style={{ padding: 8 }}>
        {order.items.map((item) => item.product.name).join(", ")}
      </td>
      <td style={{ padding: 8 }}>&yen;{order.total_amount.toLocaleString()}</td>
      <td style={{ padding: 8 }}>{order.status}</td>
      <td style={{ padding: 8, whiteSpace: "nowrap" }}>
        {order.shipping_postal_code ? (
          <>
            〒{order.shipping_postal_code}
            <br />
            {order.shipping_prefecture}
            {order.shipping_city}
            {order.shipping_address_line}
            <br />
            {order.shipping_recipient_name} 様
            <br />
            {order.shipping_phone}
          </>
        ) : (
          "-"
        )}
      </td>
      <td style={{ padding: 8 }}>
        <select
          value={shippingStatus}
          onChange={(e) => setShippingStatus(e.target.value as ShippingStatus)}
        >
          <option value="not_shipped">未発送</option>
          <option value="shipped">発送済み</option>
        </select>
      </td>
      <td style={{ padding: 8 }}>
        <input
          type="text"
          placeholder="追跡番号"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          style={{ width: 140 }}
        />
      </td>
      <td style={{ padding: 8 }}>
        <button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "更新"}
        </button>
        {error && (
          <div style={{ color: "var(--color-danger)", fontSize: "0.8rem" }}>{error}</div>
        )}
      </td>
    </tr>
  );
}

function AdminOrdersContent() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminOrders(token)
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "取得に失敗しました")
      );
  }, [token]);

  const handleUpdated = (updated: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  return (
    <>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {orders.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>注文がありません。</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: 8 }}>注文ID</th>
                <th style={{ padding: 8 }}>購入者</th>
                <th style={{ padding: 8 }}>商品</th>
                <th style={{ padding: 8 }}>合計金額</th>
                <th style={{ padding: 8 }}>決済状態</th>
                <th style={{ padding: 8 }}>配送先</th>
                <th style={{ padding: 8 }}>発送状態</th>
                <th style={{ padding: 8 }}>追跡番号</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {token &&
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    token={token}
                    onUpdated={handleUpdated}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return <AdminOrdersContent />;
}
