<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<style>
    body {
        font-family: "NotoSansJP", sans-serif;
        color: #1a1a1a;
        padding: 40px;
    }
    h1 {
        text-align: center;
        letter-spacing: 4px;
        font-size: 22px;
        margin-bottom: 32px;
    }
    .meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #6b6b73;
        margin-bottom: 24px;
    }
    .recipient {
        font-size: 16px;
        margin-bottom: 24px;
        border-bottom: 2px solid #1a1a1a;
        padding-bottom: 8px;
        display: inline-block;
    }
    .total {
        font-size: 20px;
        margin: 24px 0;
        border-top: 2px solid #1a1a1a;
        border-bottom: 2px solid #1a1a1a;
        padding: 12px 0;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: 24px;
    }
    table th, table td {
        text-align: left;
        padding: 6px 4px;
        border-bottom: 1px solid #e2e2e2;
    }
    .note {
        margin-top: 24px;
        font-size: 12px;
    }
    .issuer {
        margin-top: 48px;
        text-align: right;
        font-size: 12px;
    }
</style>
</head>
<body>
    <h1>領 収 書</h1>

    <div class="meta">
        <span>注文番号: {{ $order->id }}</span>
        <span>発行日: {{ $order->created_at->format('Y年n月j日') }}</span>
    </div>

    <div class="recipient">{{ $order->user->name }} 様</div>

    <div class="total">
        合計 &yen;{{ number_format($order->total_amount) }}
    </div>

    <div class="note">但し 宝石代として上記正に領収いたしました。</div>

    <table>
        <thead>
            <tr>
                <th>商品名</th>
                <th>金額</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>&yen;{{ number_format($item->price) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="issuer">Clarijewel</div>
</body>
</html>
