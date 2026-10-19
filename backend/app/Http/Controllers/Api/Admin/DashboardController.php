<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * 在庫状態のサマリーと、予約中・売約済み商品の一覧を返す（在庫しきい値アラート代替）。
     */
    public function inventorySummary(): JsonResponse
    {
        $counts = Product::query()
            ->select('stock_status', DB::raw('count(*) as count'))
            ->groupBy('stock_status')
            ->pluck('count', 'stock_status');

        $needsAttention = Product::query()
            ->whereIn('stock_status', ['reserved', 'sold'])
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get(['id', 'name', 'sku', 'stock_status', 'updated_at']);

        return response()->json([
            'available' => (int) ($counts['available'] ?? 0),
            'reserved' => (int) ($counts['reserved'] ?? 0),
            'sold' => (int) ($counts['sold'] ?? 0),
            'needs_attention' => $needsAttention,
        ]);
    }

    /**
     * 直近12ヶ月分の月別売上（支払い済み注文のみ）を返す。
     */
    public function salesSummary(): JsonResponse
    {
        $since = now()->subMonths(11)->startOfMonth();

        $rows = Order::query()
            ->where('status', 'paid')
            ->where('created_at', '>=', $since)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('sum(total_amount) as total'),
                DB::raw('count(*) as order_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = collect(range(0, 11))->map(function (int $i) use ($since) {
            return $since->copy()->addMonths($i)->format('Y-m');
        });

        $series = $months->map(function (string $month) use ($rows) {
            $row = $rows->get($month);

            return [
                'month' => $month,
                'total' => (int) ($row->total ?? 0),
                'order_count' => (int) ($row->order_count ?? 0),
            ];
        });

        return response()->json($series->values());
    }
}
