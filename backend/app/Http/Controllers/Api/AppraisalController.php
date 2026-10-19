<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appraisal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AppraisalController extends Controller
{
    /**
     * 鑑定書番号（シリアル）による真贋照会。ログイン不要の公開API。
     */
    public function verify(string $serialNumber): JsonResponse
    {
        $appraisal = Appraisal::where('serial_number', $serialNumber)
            ->with('product:id,name,gem_type,metal_type')
            ->first();

        abort_unless($appraisal, 404, '該当する鑑定書が見つかりません。');

        return response()->json([
            'serial_number' => $appraisal->serial_number,
            'issued_by' => $appraisal->issued_by,
            'issued_at' => $appraisal->issued_at,
            'product' => [
                'name' => $appraisal->product->name,
                'gem_type' => $appraisal->product->gem_type,
                'metal_type' => $appraisal->product->metal_type,
            ],
        ]);
    }

    /**
     * マイページから、購入済み商品の鑑定書PDFをダウンロードする。
     * 未購入ユーザーはpdf_pathを直接知っていても取得できないようにする。
     */
    public function download(Request $request, Appraisal $appraisal): StreamedResponse
    {
        $user = $request->user();

        $hasPurchased = $user->orders()
            ->where('status', 'paid')
            ->whereHas('items', function ($query) use ($appraisal) {
                $query->where('product_id', $appraisal->product_id);
            })
            ->exists();

        abort_unless($hasPurchased, 403, 'この鑑定書をダウンロードする権限がありません。');

        abort_unless(Storage::exists($appraisal->pdf_path), 404, '鑑定書ファイルが見つかりません。');

        return Storage::download(
            $appraisal->pdf_path,
            "appraisal_{$appraisal->product_id}.pdf"
        );
    }
}
