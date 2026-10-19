export default function VisitReservationPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>来店のご予約</h1>

      <section style={{ marginBottom: 40 }}>
        <p>
          全店舗、完全予約制のサロン形態でお客様をお迎えしております。店舗一覧・営業時間は
          <a href="/#stores"> 店舗情報</a>
          をご確認ください。
        </p>
        <p>
          ご予約は<a href="/mypage#consultation"> マイページの専門家への相談予約フォーム</a>
          より「店舗相談」を選択のうえお申し込みください(会員登録・ログインが必要です)。
        </p>
      </section>

      <section>
        <p style={{ color: "var(--color-muted)" }}>
          会員登録がお済みでない方は
          <a href="/register"> 新規登録</a>
          へ。ご不明点は
          <a href="/contact"> お問い合わせ</a>
          からもご連絡いただけます。
        </p>
      </section>
    </div>
  );
}
