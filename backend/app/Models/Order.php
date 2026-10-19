<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_payment_intent_id',
        'status',
        'total_amount',
        'coupon_code',
        'discount_amount',
        'shipping_status',
        'tracking_number',
        'shipped_at',
        'agreed_no_return',
        'shipping_recipient_name',
        'shipping_phone',
        'shipping_postal_code',
        'shipping_prefecture',
        'shipping_city',
        'shipping_address_line',
    ];

    protected function casts(): array
    {
        return [
            'shipped_at' => 'datetime',
            'agreed_no_return' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
