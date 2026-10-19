"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCart } from "@/lib/CartContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

type Status = "loading" | "succeeded" | "processing" | "failed";

const STATUS_MESSAGE: Record<Status, string> = {
  loading: "決済状況を確認しています...",
  succeeded: "お支払いが完了しました。ご購入ありがとうございます。",
  processing:
    "お支払い処理中です（コンビニ払いの場合、お支払い完了までお時間がかかります）。",
  failed: "お支払いに失敗しました。もう一度お試しください。",
};

export default function CheckoutCompletePage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<Status>("loading");

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");

    // リダイレクトを伴わずその場で決済が完了したケース（カード決済など）
    if (!clientSecret) {
      if (orderId) {
        clearCart();
        setStatus("succeeded");
      } else {
        setStatus("failed");
      }
      return;
    }

    let stripe: Stripe | null = null;

    stripePromise.then(async (s) => {
      stripe = s;
      if (!stripe) return;

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      if (paymentIntent?.status === "succeeded") {
        clearCart();
        setStatus("succeeded");
      } else if (
        paymentIntent?.status === "processing" ||
        paymentIntent?.status === "requires_action"
      ) {
        setStatus("processing");
      } else {
        setStatus("failed");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 480 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 16 }}>お支払い結果</h1>
      <p>{STATUS_MESSAGE[status]}</p>
      {status === "succeeded" && (
        <>
          {orderId && <p style={{ marginTop: 16 }}>注文番号: {orderId}</p>}
          <p style={{ marginTop: 8 }}>
            <a href="/mypage">マイページで購入履歴を確認する</a>
          </p>
        </>
      )}
      {status === "failed" && (
        <p style={{ marginTop: 16 }}>
          <a href="/cart">カートに戻る</a>
        </p>
      )}
    </div>
  );
}
