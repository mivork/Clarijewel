"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function VerifyIndexPage() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    router.push(`/verify/${encodeURIComponent(serialNumber.trim())}`);
  };

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 480 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 16 }}>鑑定書 真贋照会</h1>
      <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
        鑑定書に記載された鑑定書番号を入力するか、QRコードを読み取って照会してください。
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="例: CLJ-XXXXXXXXXX"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">照会する</button>
      </form>
    </div>
  );
}
