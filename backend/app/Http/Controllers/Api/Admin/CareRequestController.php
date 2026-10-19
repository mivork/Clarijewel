<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CareRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $careRequests = CareRequest::query()
            ->with('warranty.orderItem.product:id,name', 'warranty.orderItem.order.user:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CareRequest $c) => $this->transform($c));

        return response()->json($careRequests);
    }

    public function updateStatus(Request $request, CareRequest $careRequest): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:requested,in_progress,completed'],
        ]);

        $careRequest->update([
            ...$validated,
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        $careRequest->load('warranty.orderItem.product:id,name', 'warranty.orderItem.order.user:id,name,email');

        return response()->json($this->transform($careRequest));
    }

    private function transform(CareRequest $c): array
    {
        return [
            'id' => $c->id,
            'request_type' => $c->request_type,
            'status' => $c->status,
            'notes' => $c->notes,
            'created_at' => $c->created_at,
            'product_name' => $c->warranty->orderItem->product->name,
            'user' => [
                'name' => $c->warranty->orderItem->order->user->name,
                'email' => $c->warranty->orderItem->order->user->email,
            ],
        ];
    }
}
