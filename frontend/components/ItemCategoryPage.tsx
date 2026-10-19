import { fetchProducts } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

export default async function ItemCategoryPage({
  category,
  description,
}: {
  category: string;
  description: string;
}) {
  const products = await fetchProducts({ category }).catch(() => []);

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.8rem", letterSpacing: "0.04em", marginBottom: 8 }}>
        {category}
      </h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>{description}</p>

      {products.length === 0 ? (
        <p style={{ color: "var(--color-muted)", padding: "24px 0" }}>
          現在ご紹介できる{category}がありません。
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
