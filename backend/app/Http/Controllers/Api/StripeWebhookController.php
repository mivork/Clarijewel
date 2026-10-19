<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(private readonly OrderFulfillmentService $fulfillment)
    {
    }

    /**
     * Stripeからの決済結果通知を受け取り、注文と在庫状態を確定させる。
     * 決済の確定はクライアントの申告ではなく必ずこのWebhookを起点にする。
     */
    public function handle(Request $request)
    {
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent = $event->data->object;

            DB::transaction(function () use ($intent) {
                $order = Order::where('stripe_payment_intent_id', $intent->id)
                    ->lockForUpdate()
                    ->first();

                if (! $order) {
                    return;
                }

                $this->fulfillment->markPaid($order);
            });
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intent = $event->data->object;

            DB::transaction(function () use ($intent) {
                $order = Order::where('stripe_payment_intent_id', $intent->id)
                    ->lockForUpdate()
                    ->first();

                if (! $order) {
                    return;
                }

                $this->fulfillment->releaseStock($order, 'failed');
            });
        }

        return response('ok', 200);
    }
}
