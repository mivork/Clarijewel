<?php

namespace Database\Seeders;

use App\Models\CareRequest;
use App\Models\Consultation;
use App\Models\Coupon;
use App\Models\Inquiry;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Models\Wishlist;
use App\Services\OrderFulfillmentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * 動作確認・発表用のデモアカウント5件と、それぞれの状態を確認できるデモデータを作成する。
 * 実行: php artisan db:seed --class=DemoSeeder
 * デモデータは、メールアドレスが「@clarijewel.test」、商品コードが「DEMO-」で始まるもので見分けられる。
 */
class DemoSeeder extends Seeder
{
    public const PASSWORD = 'password';

    public function run(OrderFulfillmentService $fulfillment): void
    {
        if (User::where('email', 'demo-admin@clarijewel.test')->exists()) {
            $this->command?->warn('デモデータは作成済みのためスキップしました。');

            return;
        }

        $products = $this->createProducts();

        $this->createUser('デモ管理者', 'demo-admin@clarijewel.test', ['is_admin' => true]);

        // ゴールド会員: 累計110万円の購入履歴（発送済み）、保証書からのアフターケア申込、レビュー
        $gold = $this->createUser('金田 光', 'demo-gold@clarijewel.test', [
            'birthday' => '1985-04-12', 'preferred_metal' => 'Pt950', 'preferred_size' => '11号', 'marketing_opt_in' => true,
        ]);
        $order = $this->createPaidOrder($fulfillment, $gold, $products['DEMO-SOLD-01'], '11号', 60, shipped: true);
        $this->createPaidOrder($fulfillment, $gold, $products['DEMO-SOLD-02'], '45cm', 25, shipped: true);
        CareRequest::create([
            'warranty_id' => $order->items->first()->warranty->id,
            'request_type' => 'cleaning',
            'status' => 'in_progress',
            'notes' => '普段使いで輝きが落ちてきたため、クリーニングを希望します。',
        ]);
        ProductReview::create([
            'product_id' => $products['DEMO-SOLD-01']->id,
            'user_id' => $gold->id,
            'reaction' => 'good',
            'comment' => '写真以上の輝きでした。鑑定書付きで安心して購入できました。',
        ]);

        // シルバー会員: 発送済みの注文と、支払い済み・未発送の注文
        $silver = $this->createUser('銀山 美咲', 'demo-silver@clarijewel.test', [
            'birthday' => '1992-09-03', 'preferred_metal' => 'K18', 'preferred_size' => '9号',
        ]);
        $this->createPaidOrder($fulfillment, $silver, $products['DEMO-SOLD-03'], '9号', 40, shipped: true);
        $this->createPaidOrder($fulfillment, $silver, $products['DEMO-SOLD-04'], null, 2, shipped: false);

        // 一般会員: 購入履歴なし。お気に入り・来店予約・お問い合わせ・未使用の会員登録特典クーポン
        $member = $this->createUser('佐藤 花子', 'demo-member@clarijewel.test', ['preferred_size' => '11号']);
        foreach (['DEMO-001', 'DEMO-002'] as $sku) {
            Wishlist::create(['user_id' => $member->id, 'product_id' => $products[$sku]->id, 'notify_on_restock' => true]);
        }
        Consultation::create([
            'user_id' => $member->id,
            'type' => 'in_store',
            'store' => '銀座店',
            'preferred_datetime' => now()->addDays(7)->setTime(14, 0),
            'request_details' => '婚約指輪を探しています。エメラルドのリングを実際に見てみたいです。',
            'status' => 'pending',
        ]);
        Inquiry::create([
            'name' => $member->name,
            'email' => $member->email,
            'category' => 'product',
            'message' => 'エメラルドリングのサイズ直しは購入後でも可能でしょうか。',
            'status' => 'unread',
        ]);
        Coupon::create([
            'code' => 'WELCOME-DEMO0001',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'max_uses' => 1,
            'expires_at' => now()->addDays(30)->endOfDay(),
            'active' => true,
            'public' => false,
            'user_id' => $member->id,
            'first_order_only' => true,
        ]);

        // 利用停止中の会員: 管理画面の「停止・解除」の確認用
        $this->createUser('停止 太郎', 'demo-suspended@clarijewel.test', ['is_suspended' => true]);

        $this->command?->info('デモアカウントを5件作成しました（パスワードはすべて「' . self::PASSWORD . '」）。');
    }

    /**
     * @return array<string, Product>
     */
    private function createProducts(): array
    {
        $items = [
            // 購入履歴用（デモ注文で売約済みになる）
            ['DEMO-SOLD-01', 'ダイヤモンド エタニティリング', 'ダイヤモンド', 'リング', 'Pt950', 4, 1.20, 680000, 'diamond', ['9号', '11号', '13号']],
            ['DEMO-SOLD-02', 'ルビー ペンダント', 'ルビー', 'ネックレス', 'K18', 7, 1.05, 420000, 'ruby', ['40cm', '45cm']],
            ['DEMO-SOLD-03', 'サファイア リング', 'サファイア', 'リング', 'Pt900', 9, 1.50, 350000, 'sapphire', ['7号', '9号', '11号']],
            ['DEMO-SOLD-04', 'パール ピアス', 'パール', 'ピアス', 'K18', 6, null, 98000, 'pearl', []],
            // 販売中
            ['DEMO-001', 'エメラルド リング', 'エメラルド', 'リング', 'Pt950', 5, 0.85, 520000, 'emerald', ['9号', '11号', '13号']],
            ['DEMO-002', 'オパール ネックレス', 'オパール', 'ネックレス', 'K18', 10, 2.10, 180000, 'opal', ['40cm', '45cm']],
            ['DEMO-003', 'ダイヤモンド ルース', 'ダイヤモンド', 'ルース', null, 4, 0.70, 450000, 'diamond', []],
            ['DEMO-004', '【VIP限定】ピジョンブラッド ルビー リング', 'ルビー', 'リング', 'K18', 7, 2.00, 1280000, 'ruby', ['9号', '11号', '13号']],
        ];

        $products = [];
        foreach ($items as [$sku, $name, $gem, $category, $metal, $month, $carat, $price, $image, $sizes]) {
            $path = "products/thumbnails/demo-{$image}.jpg";
            if (! Storage::disk('public')->exists($path)) {
                Storage::disk('public')->put($path, file_get_contents(__DIR__ . "/demo-images/{$image}.jpg"));
            }

            $products[$sku] = Product::create([
                'name' => $name,
                'description' => "【デモ商品】{$name}。熟練の職人が一点ずつ仕上げた、鑑定書付きの一点物です。",
                'gem_type' => $gem,
                'category' => $category,
                'metal_type' => $metal,
                'birthstone_month' => $month,
                'weight_carat' => $carat,
                'price' => $price,
                'sku' => $sku,
                'stock_status' => 'available',
                'thumbnail_path' => $path,
                'available_sizes' => $sizes,
                'engravable' => $category === 'リング',
                'vip_only' => $sku === 'DEMO-004',
            ]);
        }

        return $products;
    }

    private function createUser(string $name, string $email, array $attributes = []): User
    {
        $user = User::create(array_merge([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(self::PASSWORD),
        ], array_diff_key($attributes, array_flip(['is_admin', 'is_suspended']))));

        // 認証済み・権限・停止状態は $fillable に含めていないため直接代入する
        $user->forceFill([
            'email_verified_at' => now(),
            'is_admin' => $attributes['is_admin'] ?? false,
            'is_suspended' => $attributes['is_suspended'] ?? false,
        ])->save();

        return $user;
    }

    /**
     * 実際の決済完了時と同じ処理（売約済み化・保証書発行・会員ランク更新）を通して支払い済み注文を作る。
     */
    private function createPaidOrder(
        OrderFulfillmentService $fulfillment,
        User $user,
        Product $product,
        ?string $size,
        int $daysAgo,
        bool $shipped,
    ): Order {
        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total_amount' => $product->price,
            'discount_amount' => 0,
            'agreed_no_return' => true,
            'shipping_recipient_name' => $user->name,
            'shipping_phone' => '090-0000-0000',
            'shipping_postal_code' => '104-0061',
            'shipping_prefecture' => '東京都',
            'shipping_city' => '中央区銀座',
            'shipping_address_line' => '1-2-3 デモマンション101',
        ]);
        $order->items()->create(['product_id' => $product->id, 'price' => $product->price, 'selected_size' => $size]);

        $fulfillment->markPaid($order->load('items', 'user'));

        if ($shipped) {
            $order->update([
                'shipping_status' => 'shipped',
                'tracking_number' => sprintf('DEMO-%06d', $order->id),
                'shipped_at' => now()->subDays(max($daysAgo - 2, 0)),
            ]);
        }

        // 購入日を過去の日付にずらして、履歴らしく見せる
        $order->forceFill(['created_at' => now()->subDays($daysAgo)])->save();

        return $order->load('items.warranty');
    }
}
