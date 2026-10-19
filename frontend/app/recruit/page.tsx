export default function RecruitPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>採用情報</h1>

      <section style={{ marginBottom: 40 }}>
        <p>
          Clarijewelでは、「透明性」をテーマにお客様へ宝石の価値を正しくお伝えする仲間を
          募集しています。募集職種の詳細は準備中です。
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>お問い合わせ先</h2>
        <p>
          採用に関するお問い合わせは
          <a href="/contact"> お問い合わせページ</a>
          よりご連絡ください。
        </p>
      </section>
    </div>
  );
}
