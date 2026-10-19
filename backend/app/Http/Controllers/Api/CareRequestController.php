<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warranty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CareRequestController extends Controller
{
    public function store(Request $request, Warranty $warranty): JsonResponse
    {
        $isOwner = $warranty->orderItem->order->user_id === $request->user()->id;
        abort_unless($isOwner, 403, 'この保証に対する依頼権限がありません。');

        $validated = $request->validate([
            'request_type' => ['required', 'in:cleaning,resize'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $careRequest = $warranty->careRequests()->create($validated);

        return response()->json($careRequest, 201);
    }
}
