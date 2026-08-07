<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = $this->input('type');

        $rules = [
            'topic_id' => ['required', 'integer', 'exists:topics,id'],
            'type' => ['required', Rule::in(['text', 'markdown', 'pdf', 'video'])],
            'title' => ['required', 'string', 'max:255'],
            'order_index' => ['sometimes', 'integer', 'min:0'],
        ];

        // Each content type has a different required payload — this is
        // effectively a tagged union validated per-tag.
        return match ($type) {
            'text', 'markdown' => $rules + [
                'body' => ['required', 'string'],
            ],
            'video' => $rules + [
                'youtube_url' => ['required', 'url', 'regex:/(?:youtube\.com|youtu\.be)/'],
            ],
            'pdf' => $rules + [
                // Present on create; optional on update (only required if
                // the admin is replacing the file).
                'file' => [$this->isMethod('post') ? 'required' : 'sometimes', 'file', 'mimes:pdf,ppt,pptx', 'max:20480'],
            ],
            default => $rules,
        };
    }
}
