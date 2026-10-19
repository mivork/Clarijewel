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
    .certificate {
        border: 2px solid #8f6b2e;
        padding: 32px;
    }
    h1 {
        text-align: center;
        color: #8f6b2e;
        letter-spacing: 4px;
        font-size: 22px;
        margin-bottom: 4px;
    }
    .subtitle {
        text-align: center;
        color: #6b6b73;
        font-size: 11px;
        margin-bottom: 32px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }
    table td {
        padding: 8px 4px;
        border-bottom: 1px solid #e2e2e2;
    }
    table td.label {
        width: 140px;
        color: #6b6b73;
    }
    .serial {
        margin-top: 32px;
        text-align: center;
        font-size: 14px;
        letter-spacing: 2px;
    }
    .footer {
        margin-top: 48px;
        text-align: right;
        font-size: 12px;
        color: #6b6b73;
    }
</style>
</head>
<body>
    <div class="certificate">
        <h1>鑑 定 書</h1>
        <div class="subtitle">CERTIFICATE OF APPRAISAL</div>

        <table>
            <tr>
                <td class="label">商品名</td>
                <td>{{ $product->name }}</td>
            </tr>
            <tr>
                <td class="label">宝石種別</td>
                <td>{{ $product->gem_type ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">地金</td>
                <td>{{ $product->metal_type ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">重量（カラット）</td>
                <td>{{ $product->weight_carat ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">鑑定機関</td>
                <td>{{ $issuedBy }}</td>
            </tr>
            <tr>
                <td class="label">発行日</td>
                <td>{{ $issuedAt }}</td>
            </tr>
        </table>

        <div class="serial">鑑定書番号: {{ $serialNumber }}</div>

        <div class="footer">Clarijewel</div>
    </div>
</body>
</html>
