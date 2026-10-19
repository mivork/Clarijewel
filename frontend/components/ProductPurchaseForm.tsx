"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import {
  addToWishlist,
  fetchWishlists,
  removeFromWishlist,
  STOCK_STATUS_LABEL,
  type Product,
} from "@/lib/api";

export default function ProductPurchaseForm({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const { token, user } = useAuth();
  const [size, setSize] = useState(product.available_sizes?.[0] ?? "");
  const [engraving, setEngraving] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const inCart = isInCart(product.id);

  useEffect(() => {
    if (!token) return;
    fetchWishlists(token)
      .then((list) => setIsWishlisted(list.some((w) => w.product.id === product.id)))
      .catch(() => {});
  }, [token, product.id]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
      selected_size: size || null,
      engraving_text: engraving || null,
    });
  };

  const handleToggleWishlist = async () => {
    if (!token) return;
    setWishlistBusy(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(token, product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(token, product.id);
        setIsWishlisted(true);
      }
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {product.available_sizes && product.available_sizes.length > 0 && (
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          サイズ
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {product.available_sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}

      {product.engravable && (
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          刻印テキスト（30文字まで）
          <input
            type="text"
            maxLength={30}
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            placeholder="例: Love"
          />
        </label>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        {product.stock_status !== "available" ? (
          <button type="button" disabled>
            {STOCK_STATUS_LABEL[product.stock_status]}
          </button>
        ) : (
          <button type="button" disabled={inCart} onClick={handleAddToCart}>
            {inCart ? "カートに追加済み" : "カートに追加"}
          </button>
        )}
        {user && (
          <button type="button" disabled={wishlistBusy} onClick={handleToggleWishlist}>
            {isWishlisted ? "お気に入り解除" : "お気に入りに追加"}
          </button>
        )}
      </div>
      {!user && (
        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
          お気に入り登録には <a href="/login">ログイン</a> が必要です。
        </p>
      )}
    </div>
  );
}
