const RANKS: { name: string; threshold: string; benefits: string[] }[] = [
  {
    name: "レギュラー",
    threshold: "会員登録時から",
    benefits: ["保証期間中の無料クリーニング・サイズ直しのご依頼", "鑑定書ガレージ・資産評価レポートのご利用"],
  },
  {
    name: "シルバー",
    threshold: "累計購入金額 ¥300,000以上",
    benefits: ["レギュラー特典に加え、優先的なご案内"],
  },
  {
    name: "ゴールド",
    threshold: "累計購入金額 ¥1,000,000以上",
    benefits: ["シルバー特典に加え、VIP会員限定商品の閲覧・購入"],
  },
];

export default function MemberPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>MEMBER</h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
        ご購入いただくほど、会員ランクが自動的に昇格していく仕組みです。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {RANKS.map((rank) => (
          <section
            key={rank.name}
            style={{ borderTop: "2px solid var(--color-text)", paddingTop: 16 }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: 4 }}>{rank.name}</h2>
            <p style={{ color: "var(--color-muted)", marginBottom: 12 }}>
              {rank.threshold}
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {rank.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p style={{ marginTop: 32, color: "var(--color-muted)", fontSize: "0.9rem" }}>
        会員ランクは注文完了時の累計購入金額に応じて自動更新されます。現在のランクは
        <a href="/mypage"> マイページ</a>
        でご確認いただけます。
      </p>
    </div>
  );
}
