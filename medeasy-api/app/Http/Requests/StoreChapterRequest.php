<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $chapter = $this->route('chapter');

        // course_id is required on create; on update it's fixed by the
        // existing chapter, but we still accept it if the admin wants to
        // move a chapter to a different course.
        $courseId = $this->input('course_id', $chapter?->course_id);

        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('chapters', 'slug')
                    ->where('course_id', $courseId)
                    ->ignore($chapter?->id),
            ],
            'description' => ['nullable', 'string'],
            'order_index' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
