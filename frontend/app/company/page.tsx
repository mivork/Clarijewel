const rows: [string, string][] = [
  ["会社名", "【会社名・屋号を入力してください】"],
  ["代表者", "【代表者名を入力してください】"],
  ["所在地", "【所在地を入力してください】"],
  ["設立", "【設立年月を入力してください】"],
  ["事業内容", "宝飾品の企画・販売、鑑定書発行、オンライン相談サービス"],
];

export default function CompanyPage() {
  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 24 }}>COMPANY</h1>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>ブランド理念</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p>
            Clarijewelは「透明性」をテーマに、宝石一点一点の由来と価値を正しくお伝えすることを
            大切にしています。全ての商品に鑑定書を添え、素材・カラット・仕上げの情報を
            隠すことなく開示します。
          </p>
          <p>
            一点物の宝飾品だからこそ生まれる出会いを、鑑定書という確かな裏付けとともに
            お届けし、末永くご愛用いただけるサポート体制を整えています。
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>企業情報</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
      </section>
    </div>
  );
}
