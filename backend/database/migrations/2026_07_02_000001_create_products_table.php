<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('gem_type')->nullable(); // 例: ダイヤモンド、ルビー
            $table->decimal('weight_carat', 8, 2)->nullable();
            $table->unsignedBigInteger('price'); // 円単位、高額のため整数管理
            $table->string('sku')->unique();
            // 現品限りの一点物なので単純な数量ではなく在庫状態で管理する
            $table->enum('stock_status', ['available', 'reserved', 'sold'])->default('available');
            $table->string('thumbnail_path')->nullable();
            $table->string('model_3d_path')->nullable(); // Blender書き出しのglTF/glbファイル
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
