<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\JapanesePdfFonts;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AppraisalController extends Controller
{
    /**
     * 商品情報を元に鑑定書PDFをサーバー側で自動生成し、鑑定書レコードを発行する。
     * PDFは非公開ディスクに保存し、購入者のみダウンロードできるようにする(AppraisalController::download参照)。
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'issued_by' => ['nullable', 'string', 'max:255'],
            'issued_at' => ['nullable', 'date'],
        ]);

        $serialNumber = $product->appraisal?->serial_number ?? 'CLJ-' . Str::upper(Str::random(10));
        $issuedBy = $validated['issued_by'] ?? 'Clarijewel鑑定室';
        $issuedAt = $validated['issued_at'] ?? now()->toDateString();

        JapanesePdfFonts::register();

        $pdf = Pdf::loadView('appraisals.certificate', [
            'product' => $product,
            'serialNumber' => $serialNumber,
            'issuedBy' => $issuedBy,
            'issuedAt' => $issuedAt,
        ]);

        $pdfPath = "appraisals/{$serialNumber}.pdf";
        Storage::put($pdfPath, $pdf->output());

        $appraisal = $product->appraisal()->updateOrCreate([], [
            'serial_number' => $serialNumber,
            'pdf_path' => $pdfPath,
            'issued_by' => $issuedBy,
            'issued_at' => $issuedAt,
        ]);

        return response()->json($appraisal, 201);
    }
}
