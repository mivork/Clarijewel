const FAQ: [string, string][] = [
  [
    "サイズ直しはできますか？",
    "対応可能な商品には商品ページに「サイズ直し可能」の記載があります。ご購入後、マイページの保証・アフターケアからお申し込みください。",
  ],
  [
    "鑑定書はどのように受け取れますか？",
    "ご購入手続き完了後、マイページの鑑定書ガレージからPDFをダウンロードいただけます。鑑定書番号による真贋照会も可能です。",
  ],
  [
    "支払い方法を教えてください。",
    "クレジットカード、コンビニ払い、PayPayに対応しています（Stripe決済）。",
  ],
  [
    "注文をキャンセルしたいです。",
    "発送前の注文に限り、マイページの購入履歴から取り消しが可能です。発送後のキャンセル・返品は商品の性質上お受けしておりません。",
  ],
];

export default function GuidePage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>GUIDE</h1>

      <section id="shipping" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>配送・送料について</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p>お支払い確認後、【発送までの目安日数を入力してください】以内に発送いたします。</p>
          <p>配送料は【配送料を入力してください】です。ご注文の際は配送先住所を必ずご入力ください。</p>
        </div>
      </section>

      <section id="payment" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>お支払い方法</h2>
        <p>クレジットカード、コンビニ払い、PayPayに対応しています（Stripeによる安全な決済）。</p>
      </section>

      <section id="return" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>返品・交換ポリシー</h2>
        <p>
          当店で取り扱う商品は鑑定書付きの一点物のため、お客様都合による返品・交換は
          お受けしておりません。詳しくは
          <a href="/legal/no-return"> 特定商取引法に基づく表記</a>
          をご確認ください。
        </p>
      </section>

      <section id="aftercare" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>アフターケア</h2>
        <p>
          保証期間中の無料クリーニング・サイズ直しのご依頼は
          <a href="/mypage"> マイページ</a>
          からお申し込みいただけます。
        </p>
      </section>

      <section id="faq">
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>よくある質問</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Q. {q}</p>
              <p style={{ margin: 0, color: "var(--color-muted)" }}>A. {a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
