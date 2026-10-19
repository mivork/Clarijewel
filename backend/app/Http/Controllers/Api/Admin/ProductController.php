<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\WishlistRestockMail;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Product::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $product = Product::create($this->validated($request));

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $wasAvailable = $product->stock_status === 'available';

        $product->update($this->validated($request, $product));

        // 予約中・売約済みから再びavailableに戻った場合、お気に入り登録者に再入荷を通知
        if (! $wasAvailable && $product->stock_status === 'available') {
            $this->notifyWishlisters($product);
        }

        return response()->json($product);
    }

    private function notifyWishlisters(Product $product): void
    {
        $product->wishlistedBy()
            ->where('notify_on_restock', true)
            ->with('user:id,email')
            ->get()
            ->each(fn ($wishlist) => Mail::to($wishlist->user->email)->send(
                new WishlistRestockMail($product)
            ));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => '商品を削除しました。']);
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        $skuRule = $product
            ? "unique:products,sku,{$product->id}"
            : 'unique:products,sku';

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'gem_type' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'weight_carat' => ['nullable', 'numeric'],
            'price' => ['required', 'integer', 'min:0'],
            'sku' => ['required', 'string', 'max:255', $skuRule],
            'stock_status' => ['required', 'in:available,reserved,sold'],
            'thumbnail_path' => ['nullable', 'string'],
            'model_3d_path' => ['nullable', 'string'],
            'available_sizes' => ['nullable', 'array'],
            'available_sizes.*' => ['string', 'max:50'],
            'engravable' => ['boolean'],
            'metal_type' => ['nullable', 'string', 'max:100'],
            'birthstone_month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'vip_only' => ['boolean'],
        ]);
    }
}
