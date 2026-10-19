<?php

use App\Http\Controllers\Api\Admin\AppraisalController as AdminAppraisalController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\CareRequestController as AdminCareRequestController;
use App\Http\Controllers\Api\Admin\ConsultationController as AdminConsultationController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\InquiryController as AdminInquiryController;
use App\Http\Controllers\Api\Admin\MediaController as AdminMediaController;
use App\Http\Controllers\Api\Admin\NewsArticleController as AdminNewsArticleController;
use App\Http\Controllers\Api\AppraisalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CareRequestController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\MyPageController;
use App\Http\Controllers\Api\NewsArticleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

// 商品一覧・詳細（公開）
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// 商品レビュー一覧（公開）
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);

// ニュース記事一覧・詳細（公開）
Route::get('/news', [NewsArticleController::class, 'index']);
Route::get('/news/{newsArticle}', [NewsArticleController::class, 'show']);

// 鑑定書の真贋照会（シリアル番号・QRコード遷移先、公開）
Route::get('/appraisals/verify/{serialNumber}', [AppraisalController::class, 'verify']);

// お問い合わせ（公開）
Route::post('/inquiries', [InquiryController::class, 'store']);

// 公開クーポン一覧（公開）
Route::get('/coupons/public', [CouponController::class, 'publicList']);

// 認証（公開）
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

// ログイン必須（Sanctum）
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/resend', [EmailVerificationController::class, 'resend']);
    Route::post('/checkout/payment-intent', [CheckoutController::class, 'createPaymentIntent']);
    Route::post('/coupons/validate', [CouponController::class, 'validateCode']);
    Route::get('/coupons/mine', [CouponController::class, 'mine']);
    Route::get('/appraisals/{appraisal}/download', [AppraisalController::class, 'download']);
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/mypage/purchases', [MyPageController::class, 'purchases']);

    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{order}/receipt', [OrderController::class, 'receipt']);

    Route::get('/consultations', [ConsultationController::class, 'index']);
    Route::post('/consultations', [ConsultationController::class, 'store']);

    Route::get('/wishlists', [WishlistController::class, 'index']);
    Route::post('/products/{product}/wishlist', [WishlistController::class, 'store']);
    Route::delete('/products/{product}/wishlist', [WishlistController::class, 'destroy']);

    Route::post('/warranties/{warranty}/care-requests', [CareRequestController::class, 'store']);
});

// 管理者専用（Sanctum + is_admin）
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    Route::post('/products/{product}/appraisal', [AdminAppraisalController::class, 'store']);

    Route::get('/news', [AdminNewsArticleController::class, 'index']);
    Route::post('/news', [AdminNewsArticleController::class, 'store']);
    Route::put('/news/{newsArticle}', [AdminNewsArticleController::class, 'update']);
    Route::delete('/news/{newsArticle}', [AdminNewsArticleController::class, 'destroy']);

    Route::post('/media/upload', [AdminMediaController::class, 'upload']);

    Route::get('/consultations', [AdminConsultationController::class, 'index']);
    Route::put('/consultations/{consultation}/status', [AdminConsultationController::class, 'updateStatus']);

    Route::get('/care-requests', [AdminCareRequestController::class, 'index']);
    Route::put('/care-requests/{careRequest}/status', [AdminCareRequestController::class, 'updateStatus']);

    Route::get('/inquiries', [AdminInquiryController::class, 'index']);
    Route::put('/inquiries/{inquiry}/status', [AdminInquiryController::class, 'updateStatus']);

    Route::get('/coupons', [AdminCouponController::class, 'index']);
    Route::post('/coupons', [AdminCouponController::class, 'store']);
    Route::put('/coupons/{coupon}', [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy']);

    Route::get('/dashboard/inventory', [AdminDashboardController::class, 'inventorySummary']);
    Route::get('/dashboard/sales', [AdminDashboardController::class, 'salesSummary']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::put('/orders/{order}/shipping', [AdminOrderController::class, 'updateShipping']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::put('/users/{user}/rank', [AdminUserController::class, 'updateRank']);
    Route::post('/users/{user}/suspend', [AdminUserController::class, 'suspend']);
    Route::post('/users/{user}/unsuspend', [AdminUserController::class, 'unsuspend']);
});

// Stripeからのサーバー間通信（署名検証のみで認可）
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
