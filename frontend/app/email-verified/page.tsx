export default function EmailVerifiedPage() {
  return (
    <div className="container" style={{ maxWidth: 420, padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 16 }}>
        メールアドレスの確認が完了しました
      </h1>
      <p style={{ color: "var(--color-muted)" }}>
        ご登録ありがとうございます。引き続きサイトをご利用いただけます。
      </p>
      <p style={{ marginTop: 16, lineHeight: 1.8 }}>
        はじめてのご購入にお使いいただける10%の優待コードを、ご登録のメールアドレスにお送りしました。
        <a href="/mypage">マイページ</a>からもご確認いただけます。
      </p>
      <p style={{ marginTop: 16 }}>
        <a href="/">トップページへ</a>
      </p>
    </div>
  );
}
