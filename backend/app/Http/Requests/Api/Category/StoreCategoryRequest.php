<?php

namespace App\Http\Requests\Api\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine whether the user is authorized
     * to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            /*
             * parent_id:
             *
             * NULL
             *     = Main Category
             *
             * Main Category ID
             *     = Subcategory
             *
             * A subcategory cannot be used as the parent
             * of another subcategory.
             */
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->whereNull('parent_id'),
            ],

            /*
             * Category name.
             */
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            /*
             * Slug is optional.
             *
             * If the admin does not provide it,
             * CategoryController generates it automatically.
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