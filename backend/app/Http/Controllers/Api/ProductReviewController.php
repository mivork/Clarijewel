<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'user_name' => $review->user->name,
                'reaction' => $review->reaction,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
            ]);

        return response()->json($reviews);
    }

    /**
     * 1商品につき1レビューのため、既存レビューがあれば更新する。
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => ['required', 'in:good,bad'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = $product->reviews()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'id' => $review->id,
            'reaction' => $review->reaction,
            'comment' => $review->comment,
        ], 201);
    }
}
