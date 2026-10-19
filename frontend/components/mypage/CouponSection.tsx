"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchMyCoupons, type MyCoupon } from "@/lib/api";

export default function CouponSection() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchMyCoupons(token).then(setCoupons);
  }, [token]);

  // 使えるクーポンがないときは、マイページの見出しごと出さない
  if (coupons.length === 0) return null;

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>ご利用いただけるクーポン</h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {coupons.map((c) => (
          <li
            key={c.code}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "12px 16px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span>
              <strong style={{ letterSpacing: "0.08em" }}>{c.code}</strong>
              <span style={{ marginLeft: 12 }}>
                {c.discount_type === "percentage"
                  ? `${c.discount_value}%OFF`
                  : `¥${c.discount_value.toLocaleString()}引き`}
                {c.first_order_only && "（はじめてのご購入限定）"}
              </span>
            </span>
            {c.expires_at && (
              <span style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
                {new Date(c.expires_at).toLocaleDateString("ja-JP")}まで
              </span>
            )}
          </li>
        ))}
      </ul>
      <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: 8 }}>
        カート画面でコードを選ぶと適用されます。
      </p>
    </section>
  );
}
