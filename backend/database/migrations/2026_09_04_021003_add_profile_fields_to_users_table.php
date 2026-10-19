<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('birthday')->nullable()->after('is_suspended');
            $table->date('anniversary_date')->nullable()->after('birthday');
            $table->string('preferred_metal')->nullable()->after('anniversary_date');
            $table->string('preferred_size')->nullable()->after('preferred_metal');
            $table->unsignedBigInteger('lifetime_spend')->default(0)->after('preferred_size'); // 累計購入額（円）
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'birthday',
                'anniversary_date',
                'preferred_metal',
                'preferred_size',
                'lifetime_spend',
            ]);
        });
    }
};
