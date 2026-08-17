<?php

namespace App\Http\Requests\Api\Product;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Allow the request.
     *
     * Access control is already handled by the
     * auth:sanctum and admin route middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for updating a product.
     */
    public function rules(): array
    {
        $product = $this->route('product');

        $productId = is_object($product)
            ? $product->id
            : $product;

        return [
            /*
            |--------------------------------------------------------------------------
            | Product categories
            |--------------------------------------------------------------------------
            */

            'category_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'category_ids' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'category_ids.*' => [
                'integer',
                'distinct',
                'exists:categories,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Basic product information
            |--------------------------------------------------------------------------
            */

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($productId),
            ],

            'brand' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Product price and stock
            |--------------------------------------------------------------------------
            */

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'discount_price' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
                'lte:price',
            ],

            'stock_qty' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | Product status
            |--------------------------------------------------------------------------
            */

            'status' => [
                'sometimes',
                'required',
                Rule::enum(ProductStatus::class),
            ],

            /*
            |--------------------------------------------------------------------------
            | Product specifications
            |--------------------------------------------------------------------------
            */

            'specifications' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'specifications.*' => [
                'nullable',
            ],

            /*
            |--------------------------------------------------------------------------
            | Warranty and SKU
            |--------------------------------------------------------------------------
            */

            'warranty_months' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
                'max:240',
            ],

            'sku' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($productId),
            ],

            /*
            |--------------------------------------------------------------------------
            | Product images
            |--------------------------------------------------------------------------
            |
            | Sending the images field replaces the existing image records.
            | Each image_path should contain a stored image path or URL.
            |
            */

            'images' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'images.*' => [
                'array',
            ],

            'images.*.image_path' => [
                'required',
                'string',
                'max:2048',
            ],

            'images.*.is_primary' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Product variants
            |--------------------------------------------------------------------------
            |
            | Sending variants replaces the existing variants.
            |
            */

            'variants' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'variants.*' => [
                'array',
            ],

            'variants.*.variant_name' => [
                'required',
                'string',
                'max:100',
            ],

            'variants.*.variant_value' => [
                'required',
                'string',
                'max:100',
            ],

            'variants.*.price_adjustment' => [
                'sometimes',
                'nullable',
                'numeric',
            ],

            'variants.*.stock_qty' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
            ],

            'variants.*.sku' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The product name is required.',
            'price.required' => 'The product price is required.',
            'price.min' => 'The product price cannot be negative.',

            'discount_price.lte' =>
                'The discount price must be less than or equal to the regular price.',

            'stock_qty.required' =>
                'The product stock quantity is required.',

            'stock_qty.min' =>
                'The product stock quantity cannot be negative.',

            'category_id.exists' =>
                'The selected product category does not exist.',

            'category_ids.*.exists' =>
                'One or more selected product categories do not exist.',

            'slug.unique' =>
                'Another product is already using this slug.',

            'sku.unique' =>
                'Another product is already using this SKU.',

            'images.*.image_path.required' =>
                'Every product image must contain an image path.',

            'variants.*.variant_name.required' =>
                'Every variant must contain a variant name.',

            'variants.*.variant_value.required' =>
                'Every variant must contain a variant value.',
        ];
    }
}