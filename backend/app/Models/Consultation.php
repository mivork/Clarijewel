<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'store',
        'preferred_datetime',
        'meeting_url',
        'request_details',
        'reference_image_path',
        'status',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'preferred_datetime' => 'datetime',
            'priority' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
