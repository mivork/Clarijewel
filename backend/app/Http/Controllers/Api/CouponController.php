<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * サイト上に告知してよい、現在利用可能なクーポンの一覧（公開・未ログインでも取得可）。
     */
    public function publicList(): JsonResponse
    {
        $coupons = Coupon::where('public', true)
            ->whereNull('user_id')
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get()
            ->filter(fn (Coupon $c) => $c->isValid())
            ->map(fn (Coupon $c) => [
                'code' => $c->code,
                'discount_type' => $c->discount_type,
                'discount_value' => $c->discount_value,
                'expires_at' => $c->expires_at,
            ])
            ->values();

        return response()->json($coupons);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'integer', 'min:0'],
        ]);

        $coupon = Coupon::where('code', $validated['code'])->first();

        if (! $coupon || ! $coupon->isUsableBy($request->user())) {
            return response()->json(['message' => 'クーポンコードが無効です。'], 422);
        }

        $discount = $coupon->calculateDiscount($validated['subtotal']);

        return response()->json([
            'code' => $coupon->code,
            'discount_amount' => $discount,
            'total_after_discount' => $validated['subtotal'] - $discount,
        ]);
    }

    /**
     * ログイン中の会員が今使える個人クーポン（会員登録特典など）の一覧。
     */
    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();

        $coupons = Coupon::where('user_id', $user->id)
            ->orderBy('expires_at')
            ->get()
            ->filter(fn (Coupon $c) => $c->isUsableBy($user))
            ->map(fn (Coupon $c) => [
                'code' => $c->code,
                'discount_type' => $c->discount_type,
                'discount_value' => $c->discount_value,
                'expires_at' => $c->expires_at,
                'first_order_only' => $c->first_order_only,
            ])
            ->values();

        return response()->json($coupons);
    }
}
