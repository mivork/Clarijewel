<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // 設定されている場合、その会員だけが使える個人クーポン（会員登録特典など）
            $table->foreignId('user_id')->nullable()->after('public')->constrained()->cascadeOnDelete();
            // trueの場合、支払い済みの注文がまだない会員のみ利用できる
            $table->boolean('first_order_only')->default(false)->after('user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            // 新作入荷などのお知らせメール受信への同意（特定電子メール法のオプトイン）
            $table->boolean('marketing_opt_in')->default(false)->after('preferred_size');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('first_order_only');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('marketing_opt_in');
        });
    }
};
