<?php

namespace App\Http\Requests\Api\Category;

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
        /*
         * Get the category ID from the route.
         *
         * This is needed so the current category can keep
         * its existing slug without triggering the unique
         * validation rule.
         */
        $categoryId = $this->route('category')?->id
            ?? $this->route('id');

        return [
            /*
             * Optional parent category.
             */
            'parent_id' => [
                'nullable',
                'exists:categories,id',
            ],

            /*
             * Category name.
             *
             * "sometimes" means the admin does not have to
             * send the name when updating another field.
             */
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            /*
             * Category slug.
             *
             * The current category is ignored when checking
             * whether the slug already exists.
             */
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')
                    ->ignore($categoryId),
            ],

            /*
             * Optional replacement category image.
             *
             * If no new image is uploaded, the existing image
             * will remain unchanged.
             */
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ];
    }
}