<?php

namespace App\Services;

use App\Mail\WelcomeCouponMail;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WelcomeCouponService
{
    public const DISCOUNT_PERCENT = 10;
    public const VALID_DAYS = 30;

    /**
     * 会員登録特典（初回購入10%オフ）の個人クーポンを発行する。
     * 使い捨てアドレスでの取得を防ぐため、メールアドレス確認の完了時に1人1回だけ発行する。
     */
    public function issueFor(User $user): ?Coupon
    {
        $alreadyIssued = Coupon::where('user_id', $user->id)
            ->where('first_order_only', true)
            ->exists();

        if ($alreadyIssued) {
            return null;
        }

        $coupon = Coupon::create([
            'code' => $this->generateCode(),
            'discount_type' => 'percentage',
            'discount_value' => self::DISCOUNT_PERCENT,
            'max_uses' => 1,
            'expires_at' => now()->addDays(self::VALID_DAYS)->endOfDay(),
            'active' => true,
            'public' => false,
            'user_id' => $user->id,
            'first_order_only' => true,
        ]);

        // メール送信に失敗してもクーポン自体はマイページ・購入画面から確認できるため、発行は取り消さない
        try {
            Mail::to($user)->send(new WelcomeCouponMail($user, $coupon));
        } catch (\Throwable $e) {
            Log::warning('Welcome coupon mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        return $coupon;
    }

    private function generateCode(): string
    {
        do {
            $code = 'WELCOME-' . Str::upper(Str::random(8));
        } while (Coupon::where('code', $code)->exists());

        return $code;
    }
}
