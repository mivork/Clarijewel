<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ProductController extends Controller
{
    /**
     * 商品一覧・キーワード検索・カテゴリ絞り込み
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($keyword = $request->query('q')) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('gem_type', 'like', "%{$keyword}%")
                  ->orWhereHas('appraisal', function ($appraisalQuery) use ($keyword) {
                      $appraisalQuery->where('serial_number', 'like', "%{$keyword}%");
                  });
            });
        }

        if ($gemType = $request->query('gem_type')) {
            $query->where('gem_type', $gemType);
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($metalType = $request->query('metal_type')) {
            $query->where('metal_type', $metalType);
        }

        if ($birthstoneMonth = $request->query('birthstone_month')) {
            $query->where('birthstone_month', (int) $birthstoneMonth);
        }

        if ($priceMin = $request->query('price_min')) {
            $query->where('price', '>=', (int) $priceMin);
        }

        if ($priceMax = $request->query('price_max')) {
            $query->where('price', '<=', (int) $priceMax);
        }

        // VIP限定商品はgoldランク会員のみ閲覧可能
        if (! $this->isGoldMember($request)) {
            $query->where('vip_only', false);
        }

        $products = $query->orderByDesc('created_at')->get()->map(
            fn (Product $product) => $this->transform($product)
        );

        return response()->json($products);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        if ($product->vip_only && ! $this->isGoldMember($request)) {
            abort(404);
        }

        return response()->json($this->transform($product, detail: true));
    }

    /**
     * Sanctumトークンがあれば非強制的にユーザーを解決する（未ログインでも一覧は閲覧できるため）。
     */
    private function isGoldMember(Request $request): bool
    {
        $token = $request->bearerToken();
        $user = $token ? PersonalAccessToken::findToken($token)?->tokenable : null;

        return $user?->rank === 'gold';
    }

    private function transform(Product $product, bool $detail = false): array
    {
        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'stock_status' => $product->stock_status,
            'thumbnail_url' => $product->thumbnail_path
                ? asset('storage/' . $product->thumbnail_path)
                : null,
            'vip_only' => $product->vip_only,
            'gem_type' => $product->gem_type,
            'category' => $product->category,
            'sku' => $product->sku,
        ];

        if ($detail) {
            $data['description'] = $product->description;
            $data['metal_type'] = $product->metal_type;
            $data['birthstone_month'] = $product->birthstone_month;
            $data['weight_carat'] = $product->weight_carat;
            $data['available_sizes'] = $product->available_sizes;
            $data['engravable'] = $product->engravable;
            $data['model_3d_url'] = $product->model_3d_path
                ? asset('storage/' . $product->model_3d_path)
                : null;
            $data['appraisal_serial_number'] = $product->appraisal?->serial_number;
        }

        return $data;
    }
}
