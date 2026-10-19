<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

#[Signature('orders:release-expired')]
#[Description('支払いが完了しないまま長時間経過した注文をStripeに問い合わせ、確定または在庫解放する')]
class ReleaseExpiredOrders extends Command
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly OrderFulfillmentService $fulfillment,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $staleOrders = Order::where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(30))
            ->whereNotNull('stripe_payment_intent_id')
            ->get();

        foreach ($staleOrders as $order) {
            $intent = $this->stripe->paymentIntents->retrieve($order->stripe_payment_intent_id);

            DB::transaction(function () use ($order, $intent) {
                $order = Order::where('id', $order->id)->lockForUpdate()->first();

                if (! $order || $order->status !== 'pending') {
                    // 既にWebhookで処理済み
                    return;
                }

                if ($intent->status === 'succeeded') {
                    // Webhookが何らかの理由で届いていなかったケースを自己修復する
                    $this->fulfillment->markPaid($order);
                } elseif (in_array($intent->status, ['canceled', 'requires_payment_method'], true)) {
                    $this->fulfillment->releaseStock($order, 'failed');
                }
                // processing / requires_action（コンビニ払いの入金待ちなど）はそのまま様子見する
            });
        }

        $this->info("{$staleOrders->count()}件の保留中注文を確認しました。");
    }
}
