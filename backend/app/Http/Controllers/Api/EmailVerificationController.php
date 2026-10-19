<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WelcomeCouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class EmailVerificationController extends Controller
{
    /**
     * メール本文の署名付きURLからアクセスされる（署名は signed ミドルウェアで検証済み）。
     */
    public function verify(Request $request, string $id, WelcomeCouponService $welcomeCoupons): RedirectResponse
    {
        $user = User::findOrFail($id);

        abort_unless(
            hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification())),
            403,
            '確認リンクが正しくありません。'
        );

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            $welcomeCoupons->issueFor($user);
        }

        return redirect(config('app.frontend_url') . '/email-verified');
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'メールアドレスは確認済みです。']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => '確認メールを再送信しました。']);
    }
}
