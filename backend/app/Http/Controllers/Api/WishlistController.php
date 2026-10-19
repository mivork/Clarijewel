<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wishlists = $request->user()
            ->wishlists()
            ->with('product')
            ->get()
            ->map(fn (Wishlist $w) => [
                'id' => $w->id,
                'notify_on_restock' => $w->notify_on_restock,
                'product' => [
                    'id' => $w->product->id,
                    'name' => $w->product->name,
                    'price' => $w->product->price,
                    'stock_status' => $w->product->stock_status,
                    'thumbnail_url' => $w->product->thumbnail_path
                        ? asset('storage/' . $w->product->thumbnail_path)
                        : null,
                ],
            ]);

        return response()->json($wishlists);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $wishlist = $request->user()->wishlists()->firstOrCreate(
            ['product_id' => $product->id],
            ['notify_on_restock' => true]
        );

        return response()->json($wishlist, 201);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $request->user()->wishlists()->where('product_id', $product->id)->delete();

        return response()->json(['message' => 'お気に入りから削除しました。']);
    }
}
