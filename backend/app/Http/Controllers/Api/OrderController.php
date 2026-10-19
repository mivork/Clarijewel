<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\JapanesePdfFonts;
use App\Services\OrderFulfillmentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly OrderFulfillmentService $fulfillment,
    ) {
    }

    /**
     * 発送前の支払い済み注文を、購入者自身の申請でキャンセルし全額返金する。
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'この注文をキャンセルする権限がありません。');
        abort_unless($order->status === 'paid', 422, '支払い済みの注文のみキャンセルできます。');
        abort_unless($order->shipping_status === 'not_shipped', 422, '発送済みの注文はキャンセルできません。お手数ですがサポートまでお問い合わせください。');

        if ($order->stripe_payment_intent_id) {
            $this->stripe->refunds->create([
                'payment_intent' => $order->stripe_payment_intent_id,
            ]);
        }

        DB::transaction(function () use ($order) {
            $locked = Order::where('id', $order->id)->lockForUpdate()->first();
            $this->fulfillment->cancelPaidOrder($locked);
        });

        return response()->json(['message' => '注文をキャンセルし、返金処理を行いました。']);
    }

    /**
     * 領収書PDFをその場で生成してダウンロードさせる。
     */
    public function receipt(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'この注文の領収書を取得する権限がありません。');
        abort_unless($order->status === 'paid', 404, '支払いが完了していない注文です。');

        JapanesePdfFonts::register();

        $order->load('items.product', 'user');

        return Pdf::loadView('receipts.receipt', ['order' => $order])
            ->download("receipt_{$order->id}.pdf");
    }
}
