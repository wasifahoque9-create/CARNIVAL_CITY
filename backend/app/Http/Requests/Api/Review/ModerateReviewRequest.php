<?php

namespace App\Http\Requests\Api\Review;

use App\Enums\ReviewStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ReviewStatus::class)],
        ];
    }
}
