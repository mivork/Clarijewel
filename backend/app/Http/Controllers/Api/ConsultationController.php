<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ConsultationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->consultations()->orderByDesc('preferred_datetime')->get()
        );
    }

    private const STORES = ['銀座本店', '横浜サロン', '名古屋サロン', '大阪心斎橋サロン'];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:online,in_store'],
            'store' => ['required_if:type,in_store', 'nullable', 'in:' . implode(',', self::STORES)],
            'preferred_datetime' => ['required', 'date', 'after:now'],
            'request_details' => ['nullable', 'string', 'max:2000'],
            'reference_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        $imagePath = $request->hasFile('reference_image')
            ? $request->file('reference_image')->store('consultations', 'public')
            : null;

        $consultation = $user->consultations()->create([
            'type' => $validated['type'],
            'store' => $validated['type'] === 'in_store' ? $validated['store'] : null,
            'preferred_datetime' => $validated['preferred_datetime'],
            'request_details' => $validated['request_details'] ?? null,
            'reference_image_path' => $imagePath,
            // オンラインの場合は簡易的にランダムな会議URLをその場で発行する（実際の会議室連携はしていない）
            'meeting_url' => $validated['type'] === 'online'
                ? 'https://meet.google.com/' . Str::lower(Str::random(3)) . '-' . Str::lower(Str::random(4)) . '-' . Str::lower(Str::random(3))
                : null,
            'status' => 'confirmed',
            'priority' => $user->rank === 'gold',
        ]);

        return response()->json($consultation, 201);
    }
}
