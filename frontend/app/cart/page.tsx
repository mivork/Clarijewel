"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import {
  createPaymentIntent,
  validateCoupon,
  fetchPublicCoupons,
  fetchMyCoupons,
  type ShippingAddressInput,
  type PublicCoupon,
} from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";
import CheckoutForm from "@/components/CheckoutForm";

const emptyAddress: ShippingAddressInput = {
  shipping_recipient_name: "",
  shipping_phone: "",
  shipping_postal_code: "",
  shipping_prefecture: "",
  shipping_city: "",
  shipping_address_line: "",
};

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice } = useCart();
  const { token } = useAuth();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [address, setAddress] = useState<ShippingAddressInput>(emptyAddress);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    total_after_discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);

  useEffect(() => {
    // 会員専用クーポン（会員登録特典など）を共通クーポンより先に並べる
    Promise.all([
      token ? fetchMyCoupons(token) : Promise.resolve([]),
      fetchPublicCoupons(),
    ]).then(([mine, shared]) => setPublicCoupons([...mine, ...shared]));
  }, [token]);

  const isAddressComplete = Object.values(address).every((v) => v.trim() !== "");
  const finalTotal = appliedCoupon ? appliedCoupon.total_after_discount : totalPrice;

  const handleApplyCoupon = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!couponInput.trim()) return;

    setIsCheckingCoupon(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(token, couponInput.trim(), totalPrice);
      setAppliedCoupon(res);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "クーポンコードが無効です。");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createPaymentIntent(
        token,
        items.map((item) => ({
          product_id: item.id,
          selected_size: item.selected_size,
          engraving_text: item.engraving_text,
        })),
        agreed,
        address,
        appliedCoupon?.code
      );
      setClientSecret(res.client_secret);
      setOrderId(res.order_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret(null);
    clearCart();
    router.push(`/checkout/complete?order_id=${orderId}`);
  };

  if (clientSecret && orderId) {
    return (
      <div className="container" style={{ padding: "48px 24px" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>お支払い</h1>
        <CheckoutForm
          clientSecret={clientSecret}
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>カート</h1>

      {items.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>
          カートに商品がありません。
        </p>
      ) : (
        <>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius)",
                  padding: 12,
                }}
              >
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt={item.name}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div>{item.name}</div>
                  <div className="price">
                    &yen;{item.price.toLocaleString()}
                  </div>
                  {item.selected_size && <div>サイズ: {item.selected_size}</div>}
                  {item.engraving_text && <div>刻印: {item.engraving_text}</div>}
                </div>
                <button type="button" onClick={() => removeItem(item.id)}>
                  削除
                </button>
              </li>
            ))}
          </ul>

          <h2 style={{ fontSize: "1.1rem", marginTop: 32, marginBottom: 16 }}>
            クーポン
          </h2>
          {appliedCoupon ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: 480,
              }}
            >
              <span>
                クーポン「{appliedCoupon.code}」適用中(&minus;&yen;
                {appliedCoupon.discount_amount.toLocaleString()})
              </span>
              <button type="button" onClick={handleRemoveCoupon}>
                解除
              </button>
            </div>
          ) : (
            <>
              {publicCoupons.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {publicCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCouponInput(c.code)}
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text)",
                        fontSize: "0.85rem",
                        padding: "6px 12px",
                      }}
                    >
                      {c.code}(
                      {c.discount_type === "percentage"
                        ? `${c.discount_value}%OFF`
                        : `¥${c.discount_value.toLocaleString()}引き`}
                      )
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, maxWidth: 480 }}>
                <input
                  type="text"
                  placeholder="クーポンコード"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isCheckingCoupon || !couponInput.trim()}
                >
                  {isCheckingCoupon ? "確認中..." : "適用"}
                </button>
              </div>
            </>
          )}
          {couponError && (
            <p style={{ color: "var(--color-danger)", marginTop: 8 }}>{couponError}</p>
          )}

          <h2 style={{ fontSize: "1.1rem", marginTop: 32, marginBottom: 16 }}>
            配送先
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              maxWidth: 480,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              お届け先氏名
              <input
                type="text"
                value={address.shipping_recipient_name}
                onChange={(e) =>
                  setAddress({ ...address, shipping_recipient_name: e.target.value })
                }
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              電話番号
              <input
                type="tel"
                value={address.shipping_phone}
                onChange={(e) =>
                  setAddress({ ...address, shipping_phone: e.target.value })
                }
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              郵便番号
              <input
                type="text"
                placeholder="例: 100-0001"
                value={address.shipping_postal_code}
                onChange={(e) =>
                  setAddress({ ...address, shipping_postal_code: e.target.value })
                }
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              都道府県
              <select
                value={address.shipping_prefecture}
                onChange={(e) =>
                  setAddress({ ...address, shipping_prefecture: e.target.value })
                }
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              市区町村
              <input
                type="text"
                value={address.shipping_city}
                onChange={(e) =>
                  setAddress({ ...address, shipping_city: e.target.value })
                }
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              番地・建物名
              <input
                type="text"
                value={address.shipping_address_line}
                onChange={(e) =>
                  setAddress({ ...address, shipping_address_line: e.target.value })
                }
              />
            </label>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginTop: 24,
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              本商品は
              <a href="/legal/no-return" target="_blank" rel="noreferrer">
                返品不可（特定商取引法に基づく表記）
              </a>
              であることに同意します
            </span>
          </label>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>
              {appliedCoupon && (
                <span
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  &yen;{totalPrice.toLocaleString()}
                </span>
              )}
              合計:{" "}
              <strong className="price">
                &yen;{finalTotal.toLocaleString()}
              </strong>
            </span>
            <button
              type="button"
              disabled={!agreed || !isAddressComplete || isSubmitting}
              onClick={handleCheckout}
            >
              {isSubmitting ? "処理中..." : "レジに進む"}
            </button>
          </div>
          {error && <p style={{ color: "var(--color-danger)", marginTop: 12 }}>{error}</p>}
        </>
      )}
    </div>
  );
}
