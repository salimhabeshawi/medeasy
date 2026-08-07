<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ContentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'type',
        'title',
        'body',
        'file_path',
        'file_disk',
        'file_mime',
        'file_size_bytes',
        'youtube_url',
        'order_index',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    // Whenever youtube_url is set, derive and store the raw video ID too,
    // so the frontend can build an embed URL without re-parsing it.
    public function setYoutubeUrlAttribute(?string $value): void
    {
        $this->attributes['youtube_url'] = $value;
        $this->attributes['youtube_video_id'] = $value
            ? self::extractYoutubeId($value)
            : null;
    }

    public static function extractYoutubeId(string $url): ?string
    {
        // Handles youtube.com/watch?v=ID, youtu.be/ID, and youtube.com/embed/ID
        if (preg_match('/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    // Signed/public URL for the uploaded file, if this is a 'pdf' item.
    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path || ! $this->file_disk) {
            return null;
        }

        return Storage::disk($this->file_disk)->url($this->file_path);
    }
}
