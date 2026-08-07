<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Resources\TopicResource;
use App\Models\Chapter;
use App\Models\Topic;
use App\Models\TopicProgress;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    public function show(Request $request, Topic $topic)
    {
        TopicProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'topic_id' => $topic->id],
            ['last_viewed_at' => now()],
        );

        $topic->load([
            'contentItems',
            'progress' => fn ($query) => $query->where('user_id', $request->user()->id),
        ]);

        return new TopicResource($topic);
    }

    public function outline(Request $request, Topic $topic)
    {
        $course = $topic->chapter->course->load(['chapters.topics']);

        return response()->json([
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'chapters' => $course->chapters->map(fn (Chapter $chapter) => [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'slug' => $chapter->slug,
                'order_index' => $chapter->order_index,
                'topics' => $chapter->topics->map(fn (Topic $topic) => [
                    'id' => $topic->id,
                    'title' => $topic->title,
                    'slug' => $topic->slug,
                    'order_index' => $topic->order_index,
                ]),
            ]),
        ]);
    }

    public function store(StoreTopicRequest $request)
    {
        $topic = Topic::create($request->validated());

        return new TopicResource($topic);
    }

    public function update(StoreTopicRequest $request, Topic $topic)
    {
        $topic->update($request->validated());

        return new TopicResource($topic);
    }

    public function destroy(Topic $topic)
    {
        $topic->delete();

        return response()->json(['message' => 'Topic deleted.']);
    }
}
