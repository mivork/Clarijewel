<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrderShippedMail;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['user:id,name,email', 'items.product:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function updateShipping(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'shipping_status' => ['required', 'in:not_shipped,shipped'],
            'tracking_number' => ['nullable', 'string', 'max:255'],
        ]);

        $wasShipped = $order->shipping_status === 'shipped';

        $order->update([
            ...$validated,
            'shipped_at' => $validated['shipping_status'] === 'shipped' ? ($order->shipped_at ?? now()) : null,
        ]);

        if (! $wasShipped && $validated['shipping_status'] === 'shipped') {
            Mail::to($order->user->email)->send(new OrderShippedMail($order));
        }

        return response()->json($order->fresh(['user:id,name,email', 'items.product:id,name']));
    }
}
