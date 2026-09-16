<?php

namespace App\Http\Requests\Api\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        /*
         * Get the category ID from the route.
         *
         * Route model binding normally provides a Category
         * model through the "category" parameter.
         *
         * The fallback to "id" keeps this request compatible
         * if the route uses an "id" parameter instead.
         */
        $category = $this->route('category');

        $categoryId = $category instanceof \App\Models\Category
            ? $category->id
            : $this->route('id');

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
             *
             * The current category cannot be its own parent.
             */
            'parent_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->whereNull('parent_id')
                    ->where('id', '!=', $categoryId),
            ],

            /*
             * Category name.
             *
             * "sometimes" allows the admin to update only
             * parent_id, slug, or image without resending name.
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
             * for duplicate slugs.
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
             */
            'image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ];
    }
}