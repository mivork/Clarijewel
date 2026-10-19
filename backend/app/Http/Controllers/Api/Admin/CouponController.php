<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        // 会員ごとに自動発行される個人クーポン（会員登録特典）は件数が多くなるため、手動で作成した共通クーポンのみ表示する
        return response()->json(Coupon::whereNull('user_id')->orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $coupon = Coupon::create($this->validated($request));

        return response()->json($coupon, 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon->update($this->validated($request, $coupon));

        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'クーポンを削除しました。']);
    }

    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $codeRule = $coupon
            ? "unique:coupons,code,{$coupon->id}"
            : 'unique:coupons,code';

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', $codeRule],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
            'active' => ['boolean'],
            'public' => ['boolean'],
        ]);

        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            abort(422, '割引率は100%以下で指定してください。');
        }

        return $validated;
    }
}
