<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TopicResource;
use App\Models\Topic;
use App\Models\TopicProgress;
use Illuminate\Http\Request;

class TopicProgressController extends Controller
{
    public function complete(Request $request, Topic $topic)
    {
        TopicProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'topic_id' => $topic->id],
            ['is_complete' => true, 'completed_at' => now()],
        );

        return new TopicResource($this->topicWithProgress($topic, $request->user()->id));
    }

    public function incomplete(Request $request, Topic $topic)
    {
        TopicProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'topic_id' => $topic->id],
            ['is_complete' => false, 'completed_at' => null],
        );

        return new TopicResource($this->topicWithProgress($topic, $request->user()->id));
    }

    private function topicWithProgress(Topic $topic, int $userId): Topic
    {
        $topic->load([
            'contentItems',
            'progress' => fn ($query) => $query->where('user_id', $userId),
        ]);

        return $topic;
    }
}
