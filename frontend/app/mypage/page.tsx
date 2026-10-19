"use client";

import { useAuth } from "@/lib/AuthContext";
import ProfileSection from "@/components/mypage/ProfileSection";
import CouponSection from "@/components/mypage/CouponSection";
import PurchaseSection from "@/components/mypage/PurchaseSection";
import WishlistSection from "@/components/mypage/WishlistSection";
import ConsultationSection from "@/components/mypage/ConsultationSection";

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container" style={{ padding: 48 }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: 48 }}>
        <p>
          マイページを利用するには <a href="/login">ログイン</a> してください。
        </p>
        <p style={{ marginTop: 16 }}>
          <a href="/verify">鑑定書 真贋照会はこちら →</a>
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 32 }}>マイページ</h1>
      <p style={{ marginBottom: 32 }}>
        <a href="/verify">鑑定書 真贋照会はこちら →</a>
      </p>
      <ProfileSection />
      <CouponSection />
      <div id="purchase">
        <PurchaseSection />
      </div>
      <div id="wishlist">
        <WishlistSection />
      </div>
      <div id="consultation">
        <ConsultationSection />
      </div>
    </div>
  );
}
