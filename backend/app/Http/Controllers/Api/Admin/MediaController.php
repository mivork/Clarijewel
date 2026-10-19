<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    /**
     * 商品のサムネイル画像・3Dモデルファイルをアップロードし、保存パスを返す。
     * 実際に商品へ紐付ける(thumbnail_path/model_3d_path)のは商品保存APIの役割とする。
     */
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:thumbnail,model_3d'],
            'file' => [
                'required',
                'file',
                $request->input('type') === 'thumbnail'
                    ? 'mimes:jpg,jpeg,png,webp'
                    : 'mimes:glb,gltf',
                'max:20480', // 20MB
            ],
        ]);

        $directory = $validated['type'] === 'thumbnail' ? 'products/thumbnails' : 'products/models';
        $path = $request->file('file')->store($directory, 'public');

        return response()->json([
            'path' => $path,
            'url' => asset('storage/' . $path),
        ], 201);
    }
}
