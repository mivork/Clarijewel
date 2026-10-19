<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyPageController extends Controller
{
    /**
     * 購入済み商品の一覧（鑑定書ガレージ・資産評価レポート・保証状況の元データ）。
     */
    public function purchases(Request $request): JsonResponse
    {
        $items = OrderItem::query()
            ->whereHas('order', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)->where('status', 'paid');
            })
            ->with(['product.appraisal', 'warranty.careRequests', 'order'])
            ->get();

        $purchases = $items->map(fn (OrderItem $item) => [
            'order_item_id' => $item->id,
            'order_id' => $item->order_id,
            'shipping_status' => $item->order->shipping_status,
            'purchased_at' => $item->order->created_at,
            'price' => $item->price, // 購入時価格をそのまま推定評価額として扱う
            'selected_size' => $item->selected_size,
            'engraving_text' => $item->engraving_text,
            'product' => [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'gem_type' => $item->product->gem_type,
                'thumbnail_url' => $item->product->thumbnail_path
                    ? asset('storage/' . $item->product->thumbnail_path)
                    : null,
            ],
            'appraisal' => $item->product->appraisal ? [
                'id' => $item->product->appraisal->id,
                'serial_number' => $item->product->appraisal->serial_number,
            ] : null,
            'warranty' => $item->warranty ? [
                'id' => $item->warranty->id,
                'expires_at' => $item->warranty->warranty_expires_at,
                'is_expired' => $item->warranty->isExpired(),
                'care_requests' => $item->warranty->careRequests->map(fn ($c) => [
                    'id' => $c->id,
                    'request_type' => $c->request_type,
                    'status' => $c->status,
                ]),
            ] : null,
        ]);

        return response()->json([
            'total_estimated_value' => $items->sum('price'),
            'purchases' => $purchases->values(),
        ]);
    }
}
