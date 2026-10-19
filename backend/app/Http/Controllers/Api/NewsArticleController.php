<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use Illuminate\Http\JsonResponse;

class NewsArticleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            NewsArticle::orderByDesc('published_at')->get()
        );
    }

    public function show(NewsArticle $newsArticle): JsonResponse
    {
        return response()->json($newsArticle);
    }
}
