"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchWishlists, removeFromWishlist, type WishlistEntry } from "@/lib/api";

export default function WishlistSection() {
  const { token } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistEntry[]>([]);

  const load = () => {
    if (!token) return;
    fetchWishlists(token).then(setWishlists);
  };

  useEffect(load, [token]);

  const handleRemove = async (productId: number) => {
    if (!token) return;
    await removeFromWishlist(token, productId);
    load();
  };

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>お気に入り・在庫アラート</h2>

      {wishlists.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>
          お気に入り登録した商品はありません。再入荷・在庫状況の変化をメールでお知らせします。
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {wishlists.map((w) => (
            <li
              key={w.id}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius)",
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <a href={`/products/${w.product.id}`}>{w.product.name}</a>
              <span>{w.product.stock_status}</span>
              <button type="button" onClick={() => handleRemove(w.product.id)}>
                解除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
