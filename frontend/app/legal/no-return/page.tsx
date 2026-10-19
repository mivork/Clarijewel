const rows: [string, string][] = [
  ["販売業者名", "【会社名・屋号を入力してください】"],
  ["運営統括責任者", "【代表者名を入力してください】"],
  ["所在地", "【所在地を入力してください】"],
  ["電話番号", "【電話番号を入力してください】"],
  ["メールアドレス", "【問い合わせ用メールアドレスを入力してください】"],
  ["販売価格", "各商品ページに表示する価格（消費税込み）"],
  ["商品代金以外の必要料金", "配送料（詳細は注文確認画面に表示）"],
  ["お支払い方法", "クレジットカード、コンビニ払い、PayPay"],
  ["お支払い時期", "ご注文時にお支払い手続きを行います"],
  ["商品の引き渡し時期", "お支払い確認後、【発送までの目安日数を入力してください】"],
];

export default function NoReturnPolicyPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>
        特定商取引法に基づく表記
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 32,
        }}
      >
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 16px 10px 0",
                  width: "35%",
                  verticalAlign: "top",
                  color: "var(--color-muted)",
                  fontWeight: 500,
                }}
              >
                {label}
              </th>
              <td style={{ padding: "10px 0" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>返品・交換について</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p>
          当店で取り扱う商品は、鑑定書付きの一点物の宝飾品です。お客様のご都合による返品・交換は、
          商品の性質上お受けしておりません。
        </p>
        <p>
          ただし、配送中の破損や、ご注文と異なる商品が届いた場合など、当店に起因する瑕疵については、
          商品到着後7日以内にお問い合わせください。無償にて交換・修理対応いたします。
        </p>
        <p>
          サイズ直しや刻印などお客様のご希望に応じてカスタマイズした商品についても、
          上記と同様に返品はお受けできませんので、ご注文前に内容を十分にご確認ください。
        </p>
      </div>
    </div>
  );
}
