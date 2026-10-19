<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;

class OrderFulfillmentService
{
    // 累計購入額（円）に応じた会員ランクの閾値
    private const GOLD_THRESHOLD = 1_000_000;
    private const SILVER_THRESHOLD = 300_000;

    /**
     * 決済確定を反映する。Stripe Webhookからの通知と、
     * 保留中注文の定期確認（App\Console\Commands\ReleaseExpiredOrders）の両方から呼ばれる。
     */
    public function markPaid(Order $order): void
    {
        if ($order->status === 'paid') {
            return;
        }

        $order->update(['status' => 'paid']);

        foreach ($order->items as $item) {
            $item->product()->update(['stock_status' => 'sold']);
            $item->warranty()->firstOrCreate([], ['warranty_expires_at' => now()->addYear()]);
        }

        $this->updateMemberRank($order->user);
    }

    /**
     * 決済不成立が確定した注文の在庫を解放する。
     */
    public function releaseStock(Order $order, string $status): void
    {
        if ($order->status !== 'pending') {
            return;
        }

        $order->update(['status' => $status]);

        foreach ($order->items as $item) {
            $item->product()->update(['stock_status' => 'available']);
        }

        $this->restoreCouponUse($order);
    }

    /**
     * 発送前の支払い済み注文を購入者自身の申請でキャンセルする。
     * Stripe側の返金実行は呼び出し元（OrderController）の責務とし、ここではDB状態の確定のみ行う。
     */
    public function cancelPaidOrder(Order $order): void
    {
        if ($order->status !== 'paid') {
            return;
        }

        $order->update(['status' => 'canceled']);

        foreach ($order->items as $item) {
            $item->product()->update(['stock_status' => 'available']);
        }

        $this->restoreCouponUse($order);

        // キャンセル分は累計購入額から除外されるよう、ランクを再計算する
        $this->updateMemberRank($order->user);
    }

    /**
     * 注文作成時に消費したクーポンの利用回数を戻す（決済不成立・キャンセルで、会員登録特典などが無駄にならないようにする）。
     */
    private function restoreCouponUse(Order $order): void
    {
        if (! $order->coupon_code) {
            return;
        }

        Coupon::where('code', $order->coupon_code)
            ->where('used_count', '>', 0)
            ->decrement('used_count');
    }

    /**
     * 累計購入額（支払い済み注文の合計）に応じて会員ランクを自動更新する。
     */
    private function updateMemberRank(User $user): void
    {
        $lifetimeSpend = $user->orders()->where('status', 'paid')->sum('total_amount');

        $rank = match (true) {
            $lifetimeSpend >= self::GOLD_THRESHOLD => 'gold',
            $lifetimeSpend >= self::SILVER_THRESHOLD => 'silver',
            default => 'normal',
        };

        // lifetime_spend / rank は一般ユーザーからの Mass Assignment を防ぐため $fillable に含めていないので、直接代入する
        $user->lifetime_spend = $lifetimeSpend;
        $user->rank = $rank;
        $user->save();
    }
}
