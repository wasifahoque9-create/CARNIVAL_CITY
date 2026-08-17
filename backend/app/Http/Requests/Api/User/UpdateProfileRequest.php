<?php

namespace App\Http\Requests\Api\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'addresses' => ['sometimes', 'array'],
            'addresses.*.id' => ['nullable', 'integer', 'exists:addresses,id'],
            'addresses.*.label' => ['nullable', 'string', 'max:50'],
            'addresses.*.line1' => ['required_with:addresses', 'string', 'max:255'],
            'addresses.*.line2' => ['nullable', 'string', 'max:255'],
            'addresses.*.city' => ['required_with:addresses', 'string', 'max:100'],
            'addresses.*.postal_code' => ['required_with:addresses', 'string', 'max:20'],
            'addresses.*.country' => ['required_with:addresses', 'string', 'max:100'],
            'addresses.*.is_default' => ['boolean'],
        ];
    }
}
