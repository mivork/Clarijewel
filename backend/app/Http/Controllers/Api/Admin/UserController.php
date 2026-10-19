<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'is_admin', 'rank', 'is_suspended', 'created_at']);

        return response()->json($users);
    }

    public function updateRank(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'rank' => ['required', 'in:normal,silver,gold'],
        ]);

        // rank は一般ユーザーからの Mass Assignment を防ぐため $fillable に含めていないので、直接代入する
        $user->rank = $validated['rank'];
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'is_admin', 'rank', 'is_suspended']));
    }

    public function suspend(User $user): JsonResponse
    {
        $user->is_suspended = true;
        $user->save();
        // 停止措置と同時に、そのユーザーの既存トークンを全て失効させる
        $user->tokens()->delete();

        return response()->json($user->only(['id', 'name', 'email', 'is_admin', 'rank', 'is_suspended']));
    }

    public function unsuspend(User $user): JsonResponse
    {
        $user->is_suspended = false;
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'is_admin', 'rank', 'is_suspended']));
    }
}
