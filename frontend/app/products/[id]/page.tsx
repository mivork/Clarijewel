import { notFound } from "next/navigation";
import { fetchProduct, STOCK_STATUS_LABEL } from "@/lib/api";
import ProductPurchaseForm from "@/components/ProductPurchaseForm";
import ProductViewer from "@/components/ProductViewer";
import ReviewSection from "@/components/ReviewSection";
import AppraisalQRCode from "@/components/AppraisalQRCode";

const BIRTHSTONE_MONTH_LABELS: Record<number, string> = {
  1: "1月", 2: "2月", 3: "3月", 4: "4月", 5: "5月", 6: "6月",
  7: "7月", 8: "8月", 9: "9月", 10: "10月", 11: "11月", 12: "12月",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(Number(id)).catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 32,
        }}
      >
        <ProductViewer
          modelUrl={product.model_3d_url}
          thumbnailUrl={product.thumbnail_url}
          alt={product.name}
        />
        <div>
          {product.vip_only && (
            <span
              style={{
                display: "inline-block",
                background: "var(--color-accent)",
                color: "#ffffff",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 0,
                marginBottom: 8,
              }}
            >
              VIP会員限定
            </span>
          )}
          {product.stock_status !== "available" && (
            <span
              style={{
                display: "inline-block",
                background: "var(--color-danger)",
                color: "#ffffff",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 0,
                marginBottom: 8,
                marginLeft: product.vip_only ? 8 : 0,
              }}
            >
              {STOCK_STATUS_LABEL[product.stock_status]}
            </span>
          )}
          <h1 style={{ fontSize: "1.6rem", marginTop: 0 }}>{product.name}</h1>
          <p className="price" style={{ fontSize: "1.4rem" }}>
            &yen;{product.price.toLocaleString()}
          </p>
          {product.gem_type && <p>宝石種別: {product.gem_type}</p>}
          {product.metal_type && <p>地金: {product.metal_type}</p>}
          {product.birthstone_month && (
            <p>誕生石: {BIRTHSTONE_MONTH_LABELS[product.birthstone_month]}</p>
          )}
          {product.weight_carat != null && (
            <p>重量: {product.weight_carat}ct</p>
          )}
          {product.description && (
            <p style={{ color: "var(--color-muted)" }}>
              {product.description}
            </p>
          )}

          <div style={{ margin: "16px 0" }}>
            <ProductPurchaseForm product={product} />
          </div>

          {product.appraisal_serial_number && (
            <AppraisalQRCode serialNumber={product.appraisal_serial_number} />
          )}
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}
