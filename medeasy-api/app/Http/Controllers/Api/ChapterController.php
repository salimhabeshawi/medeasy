<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreChapterRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;

class ChapterController extends Controller
{
    public function show(Chapter $chapter)
    {
        $chapter->load('topics');

        return new ChapterResource($chapter);
    }

    public function store(StoreChapterRequest $request)
    {
        $chapter = Chapter::create($request->validated());

        return new ChapterResource($chapter);
    }

    public function update(StoreChapterRequest $request, Chapter $chapter)
    {
        $chapter->update($request->validated());

        return new ChapterResource($chapter);
    }

    public function destroy(Chapter $chapter)
    {
        $chapter->delete();

        return response()->json(['message' => 'Chapter deleted.']);
    }
}
