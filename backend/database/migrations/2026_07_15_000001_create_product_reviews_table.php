<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('reaction', ['good', 'bad'])->nullable(); // 👍/👎
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'user_id']); // 1商品につき1レビュー
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
