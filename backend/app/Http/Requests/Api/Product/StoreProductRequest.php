<?php

namespace App\Http\Requests\Api\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'sku' => [
                'required',
                'string',
                'max:100',
                'unique:products,sku',
            ],

            'brand' => [
                'nullable',
                'string',
                'max:255',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'stock_qty' => [
                'required',
                'integer',
                'min:0',
            ],

            'description' => [
                'required',
                'string',
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'draft',
                    'archived',
                ]),
            ],

            'images' => [
                'required',
                'array',
                'min:1',
                'max:8',
            ],

            'images.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' =>
                'Please select a product category.',

            'category_id.exists' =>
                'The selected category does not exist.',

            'name.required' =>
                'Please enter a product name.',

            'sku.required' =>
                'Please enter a product SKU.',

            'sku.unique' =>
                'This SKU is already being used.',

            'price.required' =>
                'Please enter a product price.',

            'price.min' =>
                'The product price must be at least 0.01.',

            'stock_qty.required' =>
                'Please enter the stock quantity.',

            'description.required' =>
                'Please enter a product description.',

            'images.required' =>
                'Please select a product image.',

            'images.array' =>
                'The selected product images are invalid.',

            'images.min' =>
                'Please select at least one product image.',

            'images.max' =>
                'You may upload a maximum of 8 images.',

            'images.*.image' =>
                'Every uploaded file must be an image.',

            'images.*.mimes' =>
                'Images must be JPG, JPEG, PNG, or WebP.',

            'images.*.max' =>
                'Each image must not be larger than 4 MB.',
        ];
    }
}