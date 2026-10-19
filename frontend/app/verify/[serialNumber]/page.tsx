import { verifyAppraisal } from "@/lib/api";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ serialNumber: string }>;
}) {
  const { serialNumber } = await params;
  const result = await verifyAppraisal(serialNumber).catch(() => null);

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 560 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>鑑定書 真贋照会</h1>

      {!result ? (
        <p style={{ color: "var(--color-danger)" }}>
          鑑定書番号「{serialNumber}」に該当する鑑定書は見つかりませんでした。
        </p>
      ) : (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <p style={{ color: "var(--color-accent)" }}>✓ 正規の鑑定書として確認されました</p>
          <p>鑑定書番号: {result.serial_number}</p>
          <p>商品名: {result.product.name}</p>
          {result.product.gem_type && <p>宝石種別: {result.product.gem_type}</p>}
          {result.product.metal_type && <p>地金: {result.product.metal_type}</p>}
          {result.issued_by && <p>鑑定機関: {result.issued_by}</p>}
          {result.issued_at && <p>発行日: {result.issued_at}</p>}
        </div>
      )}
    </div>
  );
}
