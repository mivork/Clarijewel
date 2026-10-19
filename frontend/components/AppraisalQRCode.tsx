"use client";

import { QRCodeSVG } from "qrcode.react";

export default function AppraisalQRCode({ serialNumber }: { serialNumber: string }) {
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${serialNumber}`
      : `/verify/${serialNumber}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <div style={{ background: "#fff", padding: 8, borderRadius: "var(--radius)" }}>
        <QRCodeSVG value={verifyUrl} size={96} />
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
        鑑定書番号: {serialNumber}
        <br />
        QRコードから真贋照会ページへアクセスできます
      </p>
    </div>
  );
}
