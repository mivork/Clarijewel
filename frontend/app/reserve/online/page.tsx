export default function OnlineReservationPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>オンラインのご予約</h1>

      <section style={{ marginBottom: 40 }}>
        <p>
          ビデオ通話でのオンライン相談を承っております。ご予約は
          <a href="/mypage#consultation"> マイページの専門家への相談予約フォーム</a>
          より「オンライン相談」を選択のうえお申し込みください(会員登録・ログインが必要です)。
          確定後、担当者より会議URLをご案内いたします。
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
