<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route-level 'admin' middleware already gates this; kept true
        // here since per-request authorization has nothing extra to check.
        return true;
    }

    public function rules(): array
    {
        // On update, the route model 'course' exists; on create it doesn't.
        $course = $this->route('course');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('courses', 'slug')->ignore($course?->id),
            ],
            'description' => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'year' => ['required', 'integer', 'min:1', 'max:7'],
            'semester' => ['required', 'integer', 'min:1', 'max:2'],
        ];
    }
}
