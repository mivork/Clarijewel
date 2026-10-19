import { fetchProducts, fetchNewsArticles, type Product } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import ProductSearchForm from "@/components/ProductSearchForm";
import HeroCarousel from "@/components/HeroCarousel";
import { GEM_TYPES } from "@/lib/constants";

// リング専用ページ（/rings）で個別に紹介するアイテムは、ホームの一覧からは除外する
const HOME_EXCLUDED_SKUS = ["CLJ-PDIA-001", "CLJ-AMY-001"];

// 画像内にキャッチコピーが入っているため、altに同じ文言を入れて読み上げに対応する
const HERO_IMAGES = [
  {
    src: "/hero/blue-sapphire.jpg",
    alt: "凛とした気品をまとう深青の輝きが、魅了する。BLUE SAPPHIRE",
  },
  {
    src: "/hero/pink-sapphire.jpg",
    alt: "ロマンチックな色彩が、大人の女性の指先と胸元を上品に彩ります。PINK SAPPHIRE",
  },
  {
    src: "/hero/red-sapphire.jpg",
    alt: "深い情熱を宿す鮮烈な赤の輝きが心を奪う。RED SAPPHIRE",
  },
];

const CATEGORY_IMAGES: Partial<Record<(typeof GEM_TYPES)[number], string>> = {
  ダイヤモンド: "/categories/diamond.jpg",
  ルビー: "/categories/ruby.jpg",
  サファイア: "/categories/sapphire.jpg",
  エメラルド: "/categories/emerald.jpg",
  パール: "/categories/pearl.jpg",
  オパール: "/categories/opal.jpg",
};

const STORES = [
  {
    name: "銀座本店",
    address: "〒104-0061 東京都中央区銀座（約25坪）",
    feature: "オンライン配信スタジオ併設・全ラインナップ展示のフラッグシップ拠点",
    hours: "11:00 - 20:00（完全予約制）",
    facilities: "CRI90以上高演色照明 / 個室カウンセリングルーム完備",
    image: "/stores/ginza.jpg",
  },
  {
    name: "横浜サロン",
    address: "〒220-0012 神奈川県横浜市西区みなとみらい（約15坪）",
    feature: "首都圏南部エリアの拠点サロン",
    hours: "11:00 - 19:00（完全予約制）",
    facilities: "CRI90以上高演色照明 / ペア相談ブース",
    image: "/stores/yokohama.jpg",
  },
  {
    name: "名古屋サロン",
    address: "〒460-0008 愛知県名古屋市中区栄（約18坪）",
    feature: "個室カウンセリングブース2席を常設",
    hours: "11:00 - 19:00（完全予約制）",
    facilities: "CRI90以上高演色照明 / 専門カウンセラー常駐",
    image: "/stores/nagoya.jpg",
  },
  {
    name: "大阪心斎橋サロン",
    address: "〒542-0081 大阪府大阪市中央区心斎橋筋（約20坪）",
    feature: "関西エリアの拠点。宝石鑑別士が常駐",
    hours: "11:00 - 20:00（完全予約制）",
    facilities: "CRI90以上高演色照明 / 鑑別機器完備",
    image: "/stores/osaka.jpg",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    gem_type?: string;
    category?: string;
    metal_type?: string;
    birthstone_month?: string;
    price_min?: string;
    price_max?: string;
  }>;
}) {
  const params = await searchParams;
  const hasSearch = Boolean(
    params.q ||
      params.gem_type ||
      params.category ||
      params.metal_type ||
      params.birthstone_month ||
      params.price_min ||
      params.price_max
  );

  // Laravel APIが未起動のうちはエラーになるため、開発初期はcatchしてダミー表示にしてもよい
  const products = await fetchProducts({
    q: params.q,
    gem_type: params.gem_type,
    category: params.category,
    metal_type: params.metal_type,
    birthstone_month: params.birthstone_month ? Number(params.birthstone_month) : undefined,
    price_min: params.price_min ? Number(params.price_min) : undefined,
    price_max: params.price_max ? Number(params.price_max) : undefined,
  }).catch(() => []);
  const newsArticles = await fetchNewsArticles().catch(() => []);

  if (hasSearch) {
    return (
      <div className="container">
        <section style={{ padding: "48px 0 0" }}>
          <h1 style={{ fontSize: "1.8rem", letterSpacing: "0.04em" }}>検索結果</h1>
        </section>

        <ProductSearchForm />

        {products.length === 0 ? (
          <p style={{ color: "var(--color-muted)", padding: "24px 0" }}>
            条件に一致する商品がありませんでした。
          </p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    );
  }

  const homeProducts = products.filter((p) => !HOME_EXCLUDED_SKUS.includes(p.sku));
  const newArrivals = [...homeProducts].sort((a, b) => b.id - a.id).slice(0, 8);

  const byGemType = new Map<string, Product[]>();
  const others: Product[] = [];
  for (const product of homeProducts) {
    if (product.gem_type && GEM_TYPES.includes(product.gem_type)) {
      const list = byGemType.get(product.gem_type) ?? [];
      list.push(product);
      byGemType.set(product.gem_type, list);
    } else {
      others.push(product);
    }
  }

  return (
    <div>
      <section className="hero">
        <HeroCarousel images={HERO_IMAGES} />
      </section>

      <div className="container">
        {newsArticles.length > 0 && (
          <section style={{ padding: "48px 0 0" }}>
            <h2 className="section-title">新着ニュース</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {newsArticles.slice(0, 3).map((article) => (
                <li
                  key={article.id}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    padding: "12px 0",
                  }}
                >
                  <a
                    href={`/news/${article.id}`}
                    style={{ display: "flex", gap: 16, alignItems: "baseline" }}
                  >
                    {article.published_at && (
                      <span style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
                        {new Date(article.published_at).toLocaleDateString("ja-JP")}
                      </span>
                    )}
                    <span>{article.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="/news" style={{ display: "inline-block", marginTop: 12 }}>
              ニュース一覧を見る →
            </a>
          </section>
        )}

        {newArrivals.length > 0 && (
          <section id="new-arrivals" style={{ padding: "48px 0 0" }}>
            <h2 className="section-title">新着アイテム</h2>
            <ProductGrid products={newArrivals} />
          </section>
        )}

        <section id="categories" style={{ padding: "48px 0 0" }}>
          <h2 className="section-title">カテゴリーから探す</h2>
          <div className="category-grid">
            {GEM_TYPES.map((gemType) => (
              <a
                key={gemType}
                href={`/?gem_type=${encodeURIComponent(gemType)}`}
                className="category-tile"
              >
                {CATEGORY_IMAGES[gemType] ? (
                  <img
                    src={CATEGORY_IMAGES[gemType]}
                    alt={gemType}
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                ) : (
                  <div
                    className="placeholder-box"
                    aria-hidden="true"
                    style={{ aspectRatio: "4 / 3" }}
                  />
                )}
                <span>{gemType}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="search" style={{ padding: "48px 0 0" }}>
          <h2 className="section-title">絞り込み検索</h2>
          <ProductSearchForm />
        </section>

        {products.length === 0 && (
          <p style={{ color: "var(--color-muted)", padding: "24px 0" }}>
            現在表示できる商品がありません（APIサーバーが起動しているか確認してください）。
          </p>
        )}

        {GEM_TYPES.map((gemType) => {
          const list = byGemType.get(gemType);
          if (!list || list.length === 0) return null;
          return (
            <section key={gemType} style={{ padding: "48px 0 0" }}>
              <h2 className="section-title">{gemType}</h2>
              <ProductGrid products={list} />
            </section>
          );
        })}

        {others.length > 0 && (
          <section style={{ padding: "48px 0 0" }}>
            <h2 className="section-title">その他</h2>
            <ProductGrid products={others} />
          </section>
        )}

        <section id="stores" className="store-info" style={{ padding: "48px 0" }}>
          <h2 className="section-title">店舗情報</h2>
          <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
            全4店舗、完全予約制サロン形態にてお客様をお迎えしております。
          </p>
          <div className="store-grid">
            {STORES.map((store) => (
              <div key={store.name} className="store-card">
                {store.image ? (
                  <img
                    src={store.image}
                    alt={store.name}
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      marginBottom: 16,
                    }}
                  />
                ) : (
                  <div className="placeholder-box" aria-hidden="true" />
                )}
                <h3>{store.name}</h3>
                <p>{store.address}</p>
                <p>{store.feature}</p>
                <p>営業時間: {store.hours}</p>
                <p>設備: {store.facilities}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
