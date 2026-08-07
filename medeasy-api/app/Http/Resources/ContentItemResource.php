<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'topic_id' => $this->topic_id,
            'type' => $this->type,
            'title' => $this->title,
            'order_index' => $this->order_index,

            // Only relevant fields for the type are populated; the rest
            // stay null so the frontend can branch cleanly on `type`.
            'body' => $this->when(in_array($this->type, ['text', 'markdown']), $this->body),
            'file_url' => $this->when($this->type === 'pdf', $this->file_url),
            'file_mime' => $this->when($this->type === 'pdf', $this->file_mime),
            'youtube_url' => $this->when($this->type === 'video', $this->youtube_url),
            'youtube_video_id' => $this->when($this->type === 'video', $this->youtube_video_id),
        ];
    }
}
