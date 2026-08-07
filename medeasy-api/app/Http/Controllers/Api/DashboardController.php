<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TopicProgress;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function continue(Request $request)
    {
        $progress = TopicProgress::with(['topic.chapter.course'])
            ->where('user_id', $request->user()->id)
            ->whereNotNull('last_viewed_at')
            ->orderByDesc('last_viewed_at')
            ->first();

        if (! $progress) {
            return response()->noContent();
        }

        $topic = $progress->topic;
        $chapter = $topic->chapter;
        $course = $chapter->course;

        return response()->json([
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'chapter' => [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'slug' => $chapter->slug,
            ],
            'topic' => [
                'id' => $topic->id,
                'title' => $topic->title,
                'slug' => $topic->slug,
            ],
            'last_viewed_at' => $progress->last_viewed_at,
        ]);
    }
}
