<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $customerId],
            'phone' => ['nullable', 'string', 'regex:/^(?:\+8801|01)[3-9]\d{8}$/', 'unique:users,phone,' . $customerId],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid Bangladeshi phone number.',
        ];
    }
}