<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('metal_type')->nullable()->after('gem_type'); // 例: K18, Pt900
            $table->unsignedTinyInteger('birthstone_month')->nullable()->after('metal_type'); // 1-12
            $table->boolean('vip_only')->default(false)->after('engravable'); // VIP会員限定の非公開商品
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['metal_type', 'birthstone_month', 'vip_only']);
        });
    }
};
