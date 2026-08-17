<?php

namespace App\Http\Requests\Api\Cart;

use Illuminate\Foundation\Http\FormRequest;

class RemoveFromCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_item_id' => ['required', 'integer', 'exists:cart_items,id'],
        ];
    }
}
