<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class JapanesePdfFonts
{
    /**
     * dompdfの標準フォントは日本語グリフを持たないため、同梱のNoto Sans JPを登録する。
     * 登録済みならフォントキャッシュから即座に解決されるため、毎回呼んでもコストは小さい。
     */
    public static function register(): void
    {
        $fontPath = resource_path('fonts/NotoSansJP-VF.ttf');
        $fontMetrics = Pdf::getDomPDF()->getFontMetrics();

        foreach (['normal', 'bold'] as $weight) {
            $fontMetrics->registerFont(
                ['family' => 'NotoSansJP', 'style' => 'normal', 'weight' => $weight],
                'file://' . $fontPath
            );
        }
    }
}
