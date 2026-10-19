<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function __construct(private readonly StripeClient $stripe)
    {
    }

    /**
     * カート内商品からStripeのPaymentIntentを作成する。
     * 高額決済のため、金額はフロントエンドからではなくサーバー側でDB価格を元に再計算する。
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.selected_size' => ['nullable', 'string', 'max:50'],
            'items.*.engraving_text' => ['nullable', 'string', 'max:30'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            // 特商法上、返品不可であることへの同意を購入確定の必須条件とする
            'agreed_no_return' => ['required', 'accepted'],
            'shipping_recipient_name' => ['required', 'string', 'max:100'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'shipping_postal_code' => ['required', 'string', 'max:10'],
            'shipping_prefecture' => ['required', 'string', 'max:20'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_address_line' => ['required', 'string', 'max:200'],
        ]);

        $itemInputs = collect($validated['items'])->keyBy('product_id');

        return DB::transaction(function () use ($request, $itemInputs, $validated) {
            // 同時購入を防ぐため行ロックを取得した上で在庫状態を確認する
            $products = Product::whereIn('id', $itemInputs->keys())
                ->lockForUpdate()
                ->get();

            $unavailable = $products->firstWhere('stock_status', '!=', 'available');
            abort_if($unavailable, 409, "商品「{$unavailable?->name}」は既に売約済みです。");

            foreach ($products as $product) {
                $input = $itemInputs->get($product->id);

                if (! empty($input['selected_size']) && $product->available_sizes
                    && ! in_array($input['selected_size'], $product->available_sizes, true)) {
                    throw ValidationException::withMessages([
                        'items' => ["「{$product->name}」に選択できないサイズが指定されました。"],
                    ]);
                }

                if (! empty($input['engraving_text']) && ! $product->engravable) {
                    throw ValidationException::withMessages([
                        'items' => ["「{$product->name}」は刻印に対応していません。"],
                    ]);
                }
            }

            $subtotal = $products->sum('price');

            $coupon = null;
            $discountAmount = 0;
            if (! empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])->lockForUpdate()->first();
                abort_unless($coupon && $coupon->isUsableBy($request->user()), 422, 'クーポンコードが無効です。');
                $discountAmount = $coupon->calculateDiscount($subtotal);
            }

            $totalAmount = $subtotal - $discountAmount;
            abort_if($totalAmount < 50, 422, '割引後の金額が最小決済金額（50円）を下回っています。');

            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'coupon_code' => $coupon?->code,
                'discount_amount' => $discountAmount,
                'agreed_no_return' => true,
                'shipping_recipient_name' => $validated['shipping_recipient_name'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_postal_code' => $validated['shipping_postal_code'],
                'shipping_prefecture' => $validated['shipping_prefecture'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_address_line' => $validated['shipping_address_line'],
            ]);

            foreach ($products as $product) {
                $input = $itemInputs->get($product->id);

                $order->items()->create([
                    'product_id' => $product->id,
                    'price' => $product->price,
                    'selected_size' => $input['selected_size'] ?? null,
                    'engraving_text' => $input['engraving_text'] ?? null,
                ]);
                // 決済確定までは「予約中」として他ユーザーの購入をブロックする
                $product->update(['stock_status' => 'reserved']);
            }

            $coupon?->increment('used_count');

            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $totalAmount,
                'currency' => 'jpy', // 円は最小通貨単位が1円なのでamountはそのまま円数
                'metadata' => ['order_id' => $order->id],
                // カード以外にコンビニ払い・PayPay等、Stripeダッシュボードで有効化した支払い方法を自動的に含める
                'automatic_payment_methods' => ['enabled' => true],
            ]);

            $order->update(['stripe_payment_intent_id' => $paymentIntent->id]);

            return response()->json([
                'order_id' => $order->id,
                'client_secret' => $paymentIntent->client_secret,
            ]);
        });
    }
}
