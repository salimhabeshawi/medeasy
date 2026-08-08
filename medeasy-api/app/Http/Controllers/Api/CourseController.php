<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\TopicProgress;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::query();

        // Students only see published courses; admins see everything
        // (useful for previewing drafts before publishing).
        if (! $request->user()->isAdmin()) {
            $query->where('is_published', true);
        }

        // Optional year/semester filters let a student land on their own
        // term without losing the ability to browse every year/semester.
        if ($request->filled('year') && $request->filled('semester')) {
            $query->where('year', $request->integer('year'))->where('semester', $request->integer('semester'));
        }

        $courses = $query->with([
            'chapters.topics.progress' => fn ($query) => $query->where('user_id', $request->user()->id),
        ])->latest()->get();

        $this->decorateWithProgress($courses, $request->user()->id);

        return CourseResource::collection($courses);
    }

    public function show(Course $course, Request $request)
    {
        if (! $course->is_published && ! $request->user()->isAdmin()) {
            abort(404);
        }

        $course->load([
            'chapters.topics',
            'chapters.topics.progress' => fn ($query) => $query->where('user_id', $request->user()->id),
        ]);

        $this->decorateWithProgress(collect([$course]), $request->user()->id);

        return new CourseResource($course);
    }

    public function store(StoreCourseRequest $request)
    {
        $course = Course::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return new CourseResource($course);
    }

    public function update(StoreCourseRequest $request, Course $course)
    {
        $course->update($request->validated());

        return new CourseResource($course);
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }

    // Attach per-user completion readouts (topic counts and percentage) to
    // each course so the frontend can render progress without walking the
    // whole tree. One aggregate query covers every course in the batch.
    private function decorateWithProgress($courses, int $userId): void
    {
        $topicIds = $courses
            ->flatMap(fn (Course $course) => $course->chapters->flatMap->topics)
            ->pluck('id')
            ->unique();

        $completedTopicIds = TopicProgress::where('user_id', $userId)
            ->whereIn('topic_id', $topicIds)
            ->where('is_complete', true)
            ->pluck('topic_id')
            ->flip();

        foreach ($courses as $course) {
            $courseTopicIds = $course->chapters->flatMap->topics->pluck('id');
            $total = $courseTopicIds->count();
            $completed = $courseTopicIds->filter(fn ($id) => $completedTopicIds->has($id))->count();

            $course->topics_count = $total;
            $course->completed_topics_count = $completed;
            $course->completion_percentage = $total > 0 ? round($completed / $total * 100) : 0;
        }
    }
}
