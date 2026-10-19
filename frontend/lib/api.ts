const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api";

export type StockStatus = "available" | "reserved" | "sold";

export const STOCK_STATUS_LABEL: Record<Exclude<StockStatus, "available">, string> = {
  reserved: "予約中",
  sold: "売約済み",
};

export type Product = {
  id: number;
  name: string;
  price: number;
  stock_status: StockStatus;
  thumbnail_url: string | null;
  vip_only: boolean;
  description?: string | null;
  gem_type?: string | null;
  category?: string | null;
  sku?: string;
  metal_type?: string | null;
  birthstone_month?: number | null;
  weight_carat?: number | null;
  available_sizes?: string[] | null;
  engravable?: boolean;
  model_3d_url?: string | null; // Blenderで作成した3Dモデル(glTF/glb)のURL
  appraisal_serial_number?: string | null;
};

export type ProductSearchParams = {
  q?: string;
  gem_type?: string;
  category?: string;
  metal_type?: string;
  birthstone_month?: number;
  price_min?: number;
  price_max?: number;
};

export async function fetchProducts(
  params: ProductSearchParams = {},
  token?: string
): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.gem_type) query.set("gem_type", params.gem_type);
  if (params.category) query.set("category", params.category);
  if (params.metal_type) query.set("metal_type", params.metal_type);
  if (params.birthstone_month) query.set("birthstone_month", String(params.birthstone_month));
  if (params.price_min) query.set("price_min", String(params.price_min));
  if (params.price_max) query.set("price_max", String(params.price_max));

  const qs = query.toString();
  const res = await fetch(`${API_BASE_URL}/products${qs ? `?${qs}` : ""}`, {
    // 在庫状況は常に最新を表示したいのでキャッシュしない
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new Error(`商品一覧の取得に失敗しました (status: ${res.status})`);
  }

  return res.json();
}

export async function fetchProduct(id: number, token?: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new Error(`商品情報の取得に失敗しました (status: ${res.status})`);
  }

  return res.json();
}

export type NewsArticle = {
  id: number;
  title: string;
  body: string;
  published_at: string | null;
};

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE_URL}/news`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ニュース一覧の取得に失敗しました (status: ${res.status})`);
  }

  return res.json();
}

export async function fetchNewsArticle(id: number): Promise<NewsArticle> {
  const res = await fetch(`${API_BASE_URL}/news/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ニュース記事の取得に失敗しました (status: ${res.status})`);
  }

  return res.json();
}

export type UserRank = "normal" | "silver" | "gold";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  rank: UserRank;
  email_verified: boolean;
};

export type Profile = AuthUser & {
  birthday: string | null;
  anniversary_date: string | null;
  preferred_metal: string | null;
  preferred_size: string | null;
  lifetime_spend: number;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

async function parseAuthError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data.errors) {
      return Object.values(data.errors).flat().join(" ");
    }
    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  marketingOptIn = false
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, password, marketing_opt_in: marketingOptIn }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "会員登録に失敗しました"));
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ログインに失敗しました"));
  }

  return res.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  return res.json();
}

export type Review = {
  id: number;
  user_name: string;
  reaction: "good" | "bad";
  comment: string | null;
  created_at: string;
};

export async function fetchReviews(productId: number): Promise<Review[]> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("レビューの取得に失敗しました");
  }

  return res.json();
}

export async function postReview(
  token: string,
  productId: number,
  reaction: "good" | "bad",
  comment: string | null
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ reaction, comment }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "レビューの投稿に失敗しました"));
  }
}

// --- 管理者用商品CRUD ---
// 管理者APIはDBカラムをそのまま返すため、公開APIのProduct型とは形が異なる

export type AdminProduct = {
  id: number;
  name: string;
  description: string | null;
  gem_type: string | null;
  category: string | null;
  metal_type: string | null;
  birthstone_month: number | null;
  weight_carat: number | null;
  price: number;
  sku: string;
  stock_status: StockStatus;
  thumbnail_path: string | null;
  model_3d_path: string | null;
  available_sizes: string[] | null;
  engravable: boolean;
  vip_only: boolean;
};

export type ProductInput = {
  name: string;
  description?: string | null;
  gem_type?: string | null;
  category?: string | null;
  metal_type?: string | null;
  birthstone_month?: number | null;
  weight_carat?: number | null;
  price: number;
  sku: string;
  stock_status: StockStatus;
  thumbnail_path?: string | null;
  model_3d_path?: string | null;
  available_sizes?: string[] | null;
  engravable?: boolean;
  vip_only?: boolean;
};

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAdminProducts(token: string): Promise<AdminProduct[]> {
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("商品一覧の取得に失敗しました");
  }

  return res.json();
}

export async function createAdminProduct(
  token: string,
  input: ProductInput
): Promise<AdminProduct> {
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "商品の作成に失敗しました"));
  }

  return res.json();
}

export async function updateAdminProduct(
  token: string,
  id: number,
  input: ProductInput
): Promise<AdminProduct> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "商品の更新に失敗しました"));
  }

  return res.json();
}

export async function deleteAdminProduct(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "商品の削除に失敗しました"));
  }
}

export type AdminNewsArticle = {
  id: number;
  title: string;
  body: string;
  published_at: string | null;
};

export type NewsArticleInput = {
  title: string;
  body: string;
  published_at?: string | null;
};

export async function fetchAdminNewsArticles(token: string): Promise<AdminNewsArticle[]> {
  const res = await fetch(`${API_BASE_URL}/admin/news`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("ニュース一覧の取得に失敗しました");
  }

  return res.json();
}

export async function createAdminNewsArticle(
  token: string,
  input: NewsArticleInput
): Promise<AdminNewsArticle> {
  const res = await fetch(`${API_BASE_URL}/admin/news`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ニュース記事の作成に失敗しました"));
  }

  return res.json();
}

export async function updateAdminNewsArticle(
  token: string,
  id: number,
  input: NewsArticleInput
): Promise<AdminNewsArticle> {
  const res = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ニュース記事の更新に失敗しました"));
  }

  return res.json();
}

export async function deleteAdminNewsArticle(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ニュース記事の削除に失敗しました"));
  }
}

// --- 管理者用ダッシュボード ---

export type InventorySummary = {
  available: number;
  reserved: number;
  sold: number;
  needs_attention: {
    id: number;
    name: string;
    sku: string;
    stock_status: StockStatus;
    updated_at: string;
  }[];
};

export type SalesSummaryItem = {
  month: string;
  total: number;
  order_count: number;
};

export async function fetchInventorySummary(
  token: string
): Promise<InventorySummary> {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard/inventory`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("在庫状況の取得に失敗しました");
  }

  return res.json();
}

export async function fetchSalesSummary(
  token: string
): Promise<SalesSummaryItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard/sales`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("売上情報の取得に失敗しました");
  }

  return res.json();
}

// --- 管理者用注文管理 ---

export type ShippingStatus = "not_shipped" | "shipped";

export type AdminOrder = {
  id: number;
  user_id: number;
  status: "pending" | "paid" | "failed" | "canceled";
  total_amount: number;
  shipping_status: ShippingStatus;
  tracking_number: string | null;
  shipped_at: string | null;
  created_at: string;
  shipping_recipient_name: string | null;
  shipping_phone: string | null;
  shipping_postal_code: string | null;
  shipping_prefecture: string | null;
  shipping_city: string | null;
  shipping_address_line: string | null;
  user: { id: number; name: string; email: string };
  items: { id: number; price: number; product: { id: number; name: string } }[];
};

export async function fetchAdminOrders(token: string): Promise<AdminOrder[]> {
  const res = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("注文一覧の取得に失敗しました");
  }

  return res.json();
}

export async function updateOrderShipping(
  token: string,
  orderId: number,
  shippingStatus: ShippingStatus,
  trackingNumber: string | null
): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/shipping`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      shipping_status: shippingStatus,
      tracking_number: trackingNumber,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "発送状態の更新に失敗しました"));
  }

  return res.json();
}

// --- 管理者用会員管理 ---

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  rank: UserRank;
  is_suspended: boolean;
  created_at: string;
};

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("会員一覧の取得に失敗しました");
  }

  return res.json();
}

export async function updateUserRank(
  token: string,
  userId: number,
  rank: UserRank
): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/rank`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ rank }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ランクの更新に失敗しました"));
  }

  return res.json();
}

export async function suspendUser(
  token: string,
  userId: number
): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "利用停止に失敗しました"));
  }

  return res.json();
}

export async function unsuspendUser(
  token: string,
  userId: number
): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/unsuspend`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "利用停止解除に失敗しました"));
  }

  return res.json();
}

// --- プロフィール（記念日・好み設定） ---

export async function fetchProfile(token: string): Promise<Profile> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("プロフィールの取得に失敗しました");
  }

  return res.json();
}

export async function updateProfile(
  token: string,
  input: {
    birthday?: string | null;
    anniversary_date?: string | null;
    preferred_metal?: string | null;
    preferred_size?: string | null;
  }
): Promise<Profile> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "プロフィールの更新に失敗しました"));
  }

  return res.json();
}

// --- マイページ（購入履歴・鑑定書ガレージ・資産評価・保証） ---

export type Purchase = {
  order_item_id: number;
  order_id: number;
  shipping_status: ShippingStatus;
  purchased_at: string;
  price: number;
  selected_size: string | null;
  engraving_text: string | null;
  product: {
    id: number;
    name: string;
    gem_type: string | null;
    thumbnail_url: string | null;
  };
  appraisal: { id: number; serial_number: string } | null;
  warranty: {
    id: number;
    expires_at: string;
    is_expired: boolean;
    care_requests: { id: number; request_type: "cleaning" | "resize"; status: string }[];
  } | null;
};

export type PurchasesResponse = {
  total_estimated_value: number;
  purchases: Purchase[];
};

export async function fetchMyPagePurchases(token: string): Promise<PurchasesResponse> {
  const res = await fetch(`${API_BASE_URL}/mypage/purchases`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("購入履歴の取得に失敗しました");
  }

  return res.json();
}

/**
 * 認証必須のPDF等はリンク直リンクではなくfetch経由でBlobを取得し、
 * ブラウザのダウンロードとして保存させる。
 */
async function downloadFile(url: string, token: string, fileName: string, errorMessage: string): Promise<void> {
  const res = await fetch(url, { headers: authHeaders(token) });

  if (!res.ok) {
    throw new Error(errorMessage);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadAppraisalPdf(
  token: string,
  appraisalId: number,
  fileName: string
): Promise<void> {
  return downloadFile(
    `${API_BASE_URL}/appraisals/${appraisalId}/download`,
    token,
    fileName,
    "鑑定書PDFの取得に失敗しました"
  );
}

export async function downloadReceiptPdf(
  token: string,
  orderId: number,
  fileName: string
): Promise<void> {
  return downloadFile(
    `${API_BASE_URL}/orders/${orderId}/receipt`,
    token,
    fileName,
    "領収書PDFの取得に失敗しました"
  );
}

export async function cancelOrder(token: string, orderId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "注文のキャンセルに失敗しました"));
  }

  return res.json();
}

// --- 鑑定書の真贋照会（公開） ---

export type AppraisalVerification = {
  serial_number: string;
  issued_by: string | null;
  issued_at: string | null;
  product: { name: string; gem_type: string | null; metal_type: string | null };
};

export async function verifyAppraisal(serialNumber: string): Promise<AppraisalVerification> {
  const res = await fetch(`${API_BASE_URL}/appraisals/verify/${encodeURIComponent(serialNumber)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("該当する鑑定書が見つかりません");
  }

  return res.json();
}

export async function createAdminAppraisal(
  token: string,
  productId: number,
  input: { issued_by?: string | null; issued_at?: string | null }
): Promise<{ serial_number: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/appraisal`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "鑑定書の発行に失敗しました"));
  }

  return res.json();
}

// --- 専門家の相談予約 ---

export type Consultation = {
  id: number;
  type: "online" | "in_store";
  store: string | null;
  preferred_datetime: string;
  meeting_url: string | null;
  request_details: string | null;
  status: "pending" | "confirmed" | "completed" | "canceled";
  priority: boolean;
};

export async function fetchConsultations(token: string): Promise<Consultation[]> {
  const res = await fetch(`${API_BASE_URL}/consultations`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("相談予約の取得に失敗しました");
  }

  return res.json();
}

export async function createConsultation(
  token: string,
  input: {
    type: "online" | "in_store";
    store?: string;
    preferred_datetime: string;
    request_details?: string;
    reference_image?: File | null;
  }
): Promise<Consultation> {
  const formData = new FormData();
  formData.append("type", input.type);
  if (input.store) formData.append("store", input.store);
  formData.append("preferred_datetime", input.preferred_datetime);
  if (input.request_details) formData.append("request_details", input.request_details);
  if (input.reference_image) formData.append("reference_image", input.reference_image);

  const res = await fetch(`${API_BASE_URL}/consultations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "相談予約の作成に失敗しました"));
  }

  return res.json();
}

// --- お気に入り・在庫アラート ---

export type WishlistEntry = {
  id: number;
  notify_on_restock: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    stock_status: StockStatus;
    thumbnail_url: string | null;
  };
};

export async function fetchWishlists(token: string): Promise<WishlistEntry[]> {
  const res = await fetch(`${API_BASE_URL}/wishlists`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("お気に入りの取得に失敗しました");
  }

  return res.json();
}

export async function addToWishlist(token: string, productId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/wishlist`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "お気に入り登録に失敗しました"));
  }
}

export async function removeFromWishlist(token: string, productId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/wishlist`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "お気に入り解除に失敗しました"));
  }
}

// --- 保証・アフターケア依頼 ---

export async function createCareRequest(
  token: string,
  warrantyId: number,
  requestType: "cleaning" | "resize",
  notes?: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/warranties/${warrantyId}/care-requests`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ request_type: requestType, notes: notes ?? null }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "依頼の送信に失敗しました"));
  }
}

// --- 決済（チェックアウト） ---

export type CheckoutItemInput = {
  product_id: number;
  selected_size?: string | null;
  engraving_text?: string | null;
};

export type ShippingAddressInput = {
  shipping_recipient_name: string;
  shipping_phone: string;
  shipping_postal_code: string;
  shipping_prefecture: string;
  shipping_city: string;
  shipping_address_line: string;
};

export async function createPaymentIntent(
  token: string,
  items: CheckoutItemInput[],
  agreedNoReturn: boolean,
  shippingAddress: ShippingAddressInput,
  couponCode?: string
): Promise<{ order_id: number; client_secret: string }> {
  const res = await fetch(`${API_BASE_URL}/checkout/payment-intent`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      items,
      agreed_no_return: agreedNoReturn,
      coupon_code: couponCode || undefined,
      ...shippingAddress,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "決済の準備に失敗しました"));
  }

  return res.json();
}

// --- クーポン ---

export type PublicCoupon = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string | null;
};

export async function fetchPublicCoupons(): Promise<PublicCoupon[]> {
  const res = await fetch(`${API_BASE_URL}/coupons/public`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export type MyCoupon = PublicCoupon & { first_order_only: boolean };

// ログイン中の会員だけが使える個人クーポン（会員登録特典など）
export async function fetchMyCoupons(token: string): Promise<MyCoupon[]> {
  const res = await fetch(`${API_BASE_URL}/coupons/mine`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export async function validateCoupon(
  token: string,
  code: string,
  subtotal: number
): Promise<{ code: string; discount_amount: number; total_after_discount: number }> {
  const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ code, subtotal }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "クーポンコードが無効です。"));
  }

  return res.json();
}

// --- 管理者用：クーポン管理 ---

export type AdminCoupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  public: boolean;
};

export type CouponInput = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses?: number | null;
  expires_at?: string | null;
  active: boolean;
  public: boolean;
};

export async function fetchAdminCoupons(token: string): Promise<AdminCoupon[]> {
  const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("クーポン一覧の取得に失敗しました");
  }

  return res.json();
}

export async function createAdminCoupon(
  token: string,
  input: CouponInput
): Promise<AdminCoupon> {
  const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "クーポンの作成に失敗しました"));
  }

  return res.json();
}

export async function updateAdminCoupon(
  token: string,
  id: number,
  input: CouponInput
): Promise<AdminCoupon> {
  const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "クーポンの更新に失敗しました"));
  }

  return res.json();
}

export async function deleteAdminCoupon(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "クーポンの削除に失敗しました"));
  }
}

// --- パスワードリセット ---

export async function forgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "パスワード再設定メールの送信に失敗しました"));
  }

  return (await res.json()).message;
}

export async function resetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "パスワードの再設定に失敗しました"));
  }

  return (await res.json()).message;
}

// --- メールアドレス確認 ---

export async function resendVerificationEmail(token: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/email/resend`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "確認メールの再送信に失敗しました"));
  }

  return (await res.json()).message;
}

// --- 管理者用：商品画像・3Dモデルのアップロード ---

export async function uploadAdminMedia(
  token: string,
  type: "thumbnail" | "model_3d",
  file: File
): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "ファイルのアップロードに失敗しました"));
  }

  return res.json();
}

// --- 管理者用：相談予約管理 ---

export type AdminConsultation = Consultation & {
  user: { id: number; name: string; email: string };
};

export async function fetchAdminConsultations(
  token: string
): Promise<AdminConsultation[]> {
  const res = await fetch(`${API_BASE_URL}/admin/consultations`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("相談予約一覧の取得に失敗しました");
  }

  return res.json();
}

export async function updateConsultationStatus(
  token: string,
  consultationId: number,
  status: Consultation["status"]
): Promise<AdminConsultation> {
  const res = await fetch(`${API_BASE_URL}/admin/consultations/${consultationId}/status`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "状態の更新に失敗しました"));
  }

  return res.json();
}

// --- 管理者用：保証・アフターケア対応管理 ---

export type AdminCareRequest = {
  id: number;
  request_type: "cleaning" | "resize";
  status: "requested" | "in_progress" | "completed";
  notes: string | null;
  created_at: string;
  product_name: string;
  user: { name: string; email: string };
};

export async function fetchAdminCareRequests(
  token: string
): Promise<AdminCareRequest[]> {
  const res = await fetch(`${API_BASE_URL}/admin/care-requests`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("依頼一覧の取得に失敗しました");
  }

  return res.json();
}

export async function updateCareRequestStatus(
  token: string,
  careRequestId: number,
  status: AdminCareRequest["status"]
): Promise<AdminCareRequest> {
  const res = await fetch(`${API_BASE_URL}/admin/care-requests/${careRequestId}/status`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "状態の更新に失敗しました"));
  }

  return res.json();
}

// --- お問い合わせ ---

export type InquiryCategory = "general" | "product" | "salon" | "recruit" | "other";

export async function createInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  category: InquiryCategory;
  message: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "送信に失敗しました"));
  }
}

// --- 管理者用：お問い合わせ管理 ---

export type AdminInquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  category: InquiryCategory;
  message: string;
  status: "unread" | "read";
  created_at: string;
};

export async function fetchAdminInquiries(token: string): Promise<AdminInquiry[]> {
  const res = await fetch(`${API_BASE_URL}/admin/inquiries`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("問い合わせ一覧の取得に失敗しました");
  }

  return res.json();
}

export async function updateInquiryStatus(
  token: string,
  inquiryId: number,
  status: AdminInquiry["status"]
): Promise<AdminInquiry> {
  const res = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}/status`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res, "状態の更新に失敗しました"));
  }

  return res.json();
}
