<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use Illuminate\Database\Seeder;

class NewsArticleSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            [
                'title' => '秋の新作コレクション『Lumière d\'Automne』入荷のお知らせ',
                'body' => "実りの秋にふさわしい、深みのあるガーネットとシトリンを主役にした新作コレクション『Lumière d'Automne』が入荷いたしました。\n\n熟練の職人が一石ずつ丁寧に選定した宝石を、K18の温かみのある地金でお仕立てしております。数量限定となりますので、店頭にてぜひ実物の輝きをご覧ください。",
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'ジュエリー無料お手入れキャンペーン開催中',
                'body' => "日頃のご愛顧に感謝を込めて、当店でお買い上げいただいたジュエリーを対象に無料お手入れキャンペーンを実施しております。\n\n超音波洗浄によるクリーニングに加え、爪の緩みや金具の状態を専門スタッフが無料で点検いたします。大切なジュエリーを長く輝かせるために、この機会にぜひご来店ください。",
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => '創業10周年記念フェアのご案内',
                'body' => "おかげさまで、当店は本年で創業10周年を迎えることができました。日頃のご愛顧に感謝を込めて、期間限定の記念フェアを開催いたします。\n\n対象商品のポイント還元率アップに加え、鑑定書付きジュエリーのご成約者様にはオリジナルジュエリーポーチをプレゼントいたします。この機会にぜひ店頭へお立ち寄りください。",
                'published_at' => now()->subDays(10),
            ],
        ];

        foreach ($articles as $article) {
            NewsArticle::create($article);
        }
    }
}
