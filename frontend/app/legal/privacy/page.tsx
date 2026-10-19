const sections: { title: string; body: string[] }[] = [
  {
    title: "1. 個人情報の定義",
    body: [
      "本ポリシーにおいて「個人情報」とは、個人情報保護法にいう「個人情報」を指し、氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。",
    ],
  },
  {
    title: "2. 収集する情報",
    body: [
      "当店は、会員登録・商品購入・お問い合わせ等の際に、氏名、メールアドレス、配送先住所、電話番号、決済に関する情報（クレジットカード情報等は決済代行事業者であるStripe, Inc.が保持し、当店では保持しません）を取得します。",
    ],
  },
  {
    title: "3. 利用目的",
    body: [
      "・商品の発送、お支払いの確認等、本サービスの提供のため",
      "・会員からのお問い合わせに対応するため",
      "・メンテナンス、重要なお知らせなど必要に応じたご連絡のため",
      "・利用規約に違反した会員の特定、対応のため",
      "・上記の利用目的に付随する目的",
    ],
  },
  {
    title: "4. 第三者提供",
    body: [
      "当店は、あらかじめ会員の同意を得ることなく、第三者に個人情報を提供することはありません。ただし、法令に基づく場合、決済処理のためStripe, Inc.等の決済代行事業者に必要な範囲で提供する場合はこの限りではありません。",
    ],
  },
  {
    title: "5. 安全管理措置",
    body: [
      "当店は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。",
    ],
  },
  {
    title: "6. 個人情報の開示・訂正・削除",
    body: [
      "会員は、当店が保有する自己の個人情報について、開示、訂正、削除等を求めることができます。ご希望の場合は下記のお問い合わせ窓口までご連絡ください。",
    ],
  },
  {
    title: "7. Cookie等の利用",
    body: [
      "本サービスでは、ログイン状態の維持等のためCookieおよび類似の技術を利用することがあります。",
    ],
  },
  {
    title: "8. お問い合わせ窓口",
    body: [
      "個人情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。",
      "【会社名・屋号を入力してください】",
      "【問い合わせ用メールアドレスを入力してください】",
    ],
  },
  {
    title: "9. 本ポリシーの変更",
    body: [
      "当店は、必要に応じて本ポリシーの内容を変更することがあります。変更後のポリシーは、本サービス上に掲示した時点から効力を生じるものとします。",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>プライバシーポリシー</h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
        制定日: 【制定日を入力してください】
      </p>

      {sections.map((section) => (
        <section key={section.title} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: 8 }}>{section.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {section.body.map((line, i) => (
              <p key={i} style={{ margin: 0, color: "var(--color-text)" }}>
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
