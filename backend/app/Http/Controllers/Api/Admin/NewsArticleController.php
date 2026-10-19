<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsArticleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(NewsArticle::orderByDesc('published_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $article = NewsArticle::create($this->validated($request));

        return response()->json($article, 201);
    }

    public function update(Request $request, NewsArticle $newsArticle): JsonResponse
    {
        $newsArticle->update($this->validated($request));

        return response()->json($newsArticle);
    }

    public function destroy(NewsArticle $newsArticle): JsonResponse
    {
        $newsArticle->delete();

        return response()->json(['message' => 'ニュース記事を削除しました。']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'published_at' => ['nullable', 'date'],
        ]);
    }
}
