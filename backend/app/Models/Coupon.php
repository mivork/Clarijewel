<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'expires_at',
        'active',
        'public',
        'user_id',
        'first_order_only',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'active' => 'boolean',
            'public' => 'boolean',
            'first_order_only' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(): bool
    {
        if (! $this->active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * 有効期限・利用回数に加えて、個人クーポンの持ち主か・初回購入限定の条件を満たすかも確認する。
     */
    public function isUsableBy(User $user): bool
    {
        if (! $this->isValid()) {
            return false;
        }

        if ($this->user_id !== null && (int) $this->user_id !== $user->id) {
            return false;
        }

        if ($this->first_order_only && $user->orders()->where('status', 'paid')->exists()) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(int $subtotal): int
    {
        if ($this->discount_type === 'percentage') {
            return (int) floor($subtotal * $this->discount_value / 100);
        }

        return min($this->discount_value, $subtotal);
    }
}
