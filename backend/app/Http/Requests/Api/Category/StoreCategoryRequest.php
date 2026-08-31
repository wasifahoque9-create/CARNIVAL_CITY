<?php

namespace App\Http\Requests\Api\Category;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            /*
             * Optional parent category.
             * This allows categories to have subcategories
             * in the future without hardcoding category types.
             */
            'parent_id' => [
                'nullable',
                'exists:categories,id',
            ],

            /*
             * Category name entered by the admin.
             */
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            /*
             * Slug is generated automatically by the controller
             * when the admin does not provide one.
             */
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:categories,slug',
            ],

            /*
             * Optional category image.
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