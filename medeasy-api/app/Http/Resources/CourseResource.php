<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_published' => $this->is_published,
            'chapters' => ChapterResource::collection($this->whenLoaded('chapters')),
            'completion_percentage' => $this->when(isset($this->completion_percentage), $this->completion_percentage),
            'completed_topics_count' => $this->when(isset($this->completed_topics_count), $this->completed_topics_count),
            'topics_count' => $this->when(isset($this->topics_count), $this->topics_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
