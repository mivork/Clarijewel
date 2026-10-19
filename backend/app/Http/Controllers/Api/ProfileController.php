<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($this->transform($request->user()));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'birthday' => ['nullable', 'date'],
            'anniversary_date' => ['nullable', 'date'],
            'preferred_metal' => ['nullable', 'string', 'max:100'],
            'preferred_size' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json($this->transform($user));
    }

    private function transform($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'rank' => $user->rank,
            'email_verified' => $user->hasVerifiedEmail(),
            'birthday' => $user->birthday,
            'anniversary_date' => $user->anniversary_date,
            'preferred_metal' => $user->preferred_metal,
            'preferred_size' => $user->preferred_size,
            'lifetime_spend' => $user->lifetime_spend,
        ];
    }
}
