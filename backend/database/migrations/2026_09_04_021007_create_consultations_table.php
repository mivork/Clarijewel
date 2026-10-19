<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['online', 'in_store']);
            $table->dateTime('preferred_datetime');
            $table->string('meeting_url')->nullable(); // オンラインの場合、確定時に自動発行
            $table->text('request_details')->nullable(); // 事前ヒアリング（要望）
            $table->string('reference_image_path')->nullable(); // 参考画像
            $table->enum('status', ['pending', 'confirmed', 'completed', 'canceled'])->default('pending');
            $table->boolean('priority')->default(false); // VIP会員の優先相談枠
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
