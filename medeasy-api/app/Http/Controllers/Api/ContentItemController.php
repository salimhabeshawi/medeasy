<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentItemRequest;
use App\Http\Resources\ContentItemResource;
use App\Models\ContentItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentItemController extends Controller
{
    public function show(ContentItem $contentItem)
    {
        return new ContentItemResource($contentItem);
    }

    public function store(StoreContentItemRequest $request)
    {
        $data = $request->validated();

        if ($data['type'] === 'pdf' && $request->hasFile('file')) {
            $data = [...$data, ...$this->storeUploadedFile($request)];
        }

        $contentItem = ContentItem::create($data);

        return new ContentItemResource($contentItem);
    }

    public function update(StoreContentItemRequest $request, ContentItem $contentItem)
    {
        $data = $request->validated();

        if (($data['type'] ?? $contentItem->type) === 'pdf' && $request->hasFile('file')) {
            // Replacing the file: remove the old one first so orphaned
            // files don't pile up in R2 storage.
            if ($contentItem->file_path && $contentItem->file_disk) {
                Storage::disk($contentItem->file_disk)->delete($contentItem->file_path);
            }

            $data = [...$data, ...$this->storeUploadedFile($request)];
        }

        $contentItem->update($data);

        return new ContentItemResource($contentItem);
    }

    public function destroy(ContentItem $contentItem)
    {
        if ($contentItem->file_path && $contentItem->file_disk) {
            Storage::disk($contentItem->file_disk)->delete($contentItem->file_path);
        }

        $contentItem->delete();

        return response()->json(['message' => 'Content item deleted.']);
    }

    private function storeUploadedFile($request): array
    {
        $file = $request->file('file');
        $disk = config('filesystems.default') === 'r2' ? 'r2' : 'public';

        $path = $file->storeAs(
            'content-files',
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            $disk
        );

        return [
            'file_path' => $path,
            'file_disk' => $disk,
            'file_mime' => $file->getClientMimeType(),
            'file_size_bytes' => $file->getSize(),
        ];
    }
}
