<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'slug',
        'order_index',
    ];

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function contentItems(): HasMany
    {
        return $this->hasMany(ContentItem::class)->orderBy('order_index');
    }

    // A topic's progress for one user. Controllers eager-load this scoped
    // to the authenticated user (see TopicController / CourseController);
    // it is null for a user who has never recorded progress.
    public function progress(): HasOne
    {
        return $this->hasOne(TopicProgress::class);
    }
}
