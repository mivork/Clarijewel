<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'marketing_opt_in' => ['sometimes', 'boolean'],
        ]);

        $user = User::create($validated)->fresh();
        $user->sendEmailVerificationNotification();

        return response()->json([
            'user' => [
                ...$user->only(['id', 'name', 'email', 'is_admin', 'rank']),
                'email_verified' => $user->hasVerifiedEmail(),
            ],
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['メールアドレスまたはパスワードが正しくありません。'],
            ]);
        }

        abort_if($user->is_suspended, 403, 'このアカウントは利用停止中です。');

        return response()->json([
            'user' => [
                ...$user->only(['id', 'name', 'email', 'is_admin', 'rank']),
                'email_verified' => $user->hasVerifiedEmail(),
            ],
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'ログアウトしました。']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            ...$user->only(['id', 'name', 'email', 'is_admin', 'rank']),
            'email_verified' => $user->hasVerifiedEmail(),
        ]);
    }
}
