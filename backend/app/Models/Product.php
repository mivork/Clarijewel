<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'gem_type',
        'category',
        'metal_type',
        'birthstone_month',
        'weight_carat',
        'price',
        'sku',
        'stock_status',
        'thumbnail_path',
        'model_3d_path',
        'available_sizes',
        'engravable',
        'vip_only',
    ];

    protected function casts(): array
    {
        return [
            'available_sizes' => 'array',
            'engravable' => 'boolean',
            'vip_only' => 'boolean',
        ];
    }

    public function appraisal(): HasOne
    {
        return $this->hasOne(Appraisal::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function wishlistedBy(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function isAvailable(): bool
    {
        return $this->stock_status === 'available';
    }
}
