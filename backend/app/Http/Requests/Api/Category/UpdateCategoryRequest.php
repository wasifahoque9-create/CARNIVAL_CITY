<?php

namespace App\Http\Requests\Api\Category;

use App\Enums\CategoryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id ?? $this->route('id');

        return [
            'parent_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'type' => ['sometimes', Rule::enum(CategoryType::class)],
        ];
    }
}
