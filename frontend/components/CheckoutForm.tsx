"use client";

import { useState, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

function PaymentForm({
  orderId,
  clientSecret,
  onSuccess,
}: {
  orderId: number;
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // コンビニ払い・PayPayなどリダイレクトを伴う支払い方法のために戻り先URLが必須
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete?order_id=${orderId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "決済に失敗しました");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // カード決済など、その場で支払いが確定したケースのみ即座に成功扱いにする
      onSuccess();
      return;
    }

    // コンビニ払いなど、まだ支払いが完了していない（processing / requires_action）場合は
    // 「支払い済み」と誤表示しないよう、状態確認ページ側の判定に委ねる
    window.location.href =
      `${window.location.origin}/checkout/complete?order_id=${orderId}` +
      `&payment_intent_client_secret=${encodeURIComponent(clientSecret)}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}
    >
      <PaymentElement />
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? "決済処理中..." : "支払いを確定する"}
      </button>
    </form>
  );
}

export default function CheckoutForm({
  clientSecret,
  orderId,
  onSuccess,
}: {
  clientSecret: string;
  orderId: number;
  onSuccess: () => void;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
}
