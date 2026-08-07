<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $topic = $this->route('topic');
        $chapterId = $this->input('chapter_id', $topic?->chapter_id);

        return [
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('topics', 'slug')
                    ->where('chapter_id', $chapterId)
                    ->ignore($topic?->id),
            ],
            'order_index' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
