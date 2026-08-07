<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chapter_id' => $this->chapter_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'order_index' => $this->order_index,
            'content_items' => ContentItemResource::collection($this->whenLoaded('contentItems')),
            'is_complete' => (bool) $this->progress?->is_complete,
            'status' => $this->status(),
            'completed_at' => $this->progress?->completed_at,
            'last_viewed_at' => $this->progress?->last_viewed_at,
        ];
    }

    public function status(): string
    {
        if ($this->progress?->is_complete) {
            return 'complete';
        }

        // 'in_progress' means the topic has been opened and read but not
        // marked complete (see TopicController::show, which stamps
        // last_viewed_at on every topic view).
        if ($this->progress?->last_viewed_at) {
            return 'in_progress';
        }

        return 'not_started';
    }
}
