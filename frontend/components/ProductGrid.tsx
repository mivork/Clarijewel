import { STOCK_STATUS_LABEL, type Product } from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <a href={`/products/${product.id}`}>
            {product.thumbnail_url ? (
              <img src={product.thumbnail_url} alt={product.name} />
            ) : (
              <div className="placeholder-box" aria-hidden="true" />
            )}
            <div className="info">
              <span>
                {product.vip_only && (
                  <span
                    style={{
                      color: "var(--color-accent)",
                      fontSize: "0.75rem",
                      marginRight: 4,
                    }}
                  >
                    [VIP限定]
                  </span>
                )}
                {product.stock_status !== "available" && (
                  <span
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "0.75rem",
                      marginRight: 4,
                    }}
                  >
                    [{STOCK_STATUS_LABEL[product.stock_status]}]
                  </span>
                )}
                {product.name}
              </span>
              <span className="price">
                &yen;{product.price.toLocaleString()}
              </span>
            </div>
          </a>
          <div style={{ padding: "0 16px 16px" }}>
            <AddToCartButton product={product} />
          </div>
        </div>
      ))}
    </section>
  );
}
