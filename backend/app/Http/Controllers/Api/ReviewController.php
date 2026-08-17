<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Review\ModerateReviewRequest;
use App\Http\Requests\Api\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(
        StoreReviewRequest $request,
    ): JsonResponse {
        $user = $request->user();
        $productId = $request->integer('product_id');

        $alreadyReviewed = Review::query()
            ->where('product_id', $productId)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyReviewed) {
            throw ValidationException::withMessages([
                'product_id' => [
                    'You have already reviewed this product.',
                ],
            ]);
        }

        $hasPurchased = OrderItem::query()
            ->where('product_id', $productId)
            ->whereHas(
                'order',
                function ($query) use ($user) {
                    $query
                        ->where('user_id', $user->id)
                        ->where(
                            'status',
                            OrderStatus::Delivered->value,
                        );
                },
            )
            ->exists();

        if (! $hasPurchased) {
            throw ValidationException::withMessages([
                'product_id' => [
                    'You can only review products from delivered orders.',
                ],
            ]);
        }

        $review = Review::query()->create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->string('comment')->trim(),
            'status' => ReviewStatus::Pending->value,
        ]);

        return response()->json([
            'message' =>
                'Review submitted successfully and is waiting for admin approval.',

            'data' => new ReviewResource(
                $review->load('user'),
            ),
        ], 201);
    }

    public function forProduct(
        Product $product,
    ): JsonResponse {
        $reviews = Review::query()
            ->with('user')
            ->where('product_id', $product->id)
            ->where(
                'status',
                ReviewStatus::Approved->value,
            )
            ->latest()
            ->paginate(20);

        $averageRating = Review::query()
            ->where('product_id', $product->id)
            ->where(
                'status',
                ReviewStatus::Approved->value,
            )
            ->avg('rating');

        return response()->json([
            'data' => ReviewResource::collection(
                $reviews,
            ),

            'average_rating' => round(
                (float) $averageRating,
                1,
            ),

            'meta' => [
                'current_page' =>
                    $reviews->currentPage(),

                'last_page' =>
                    $reviews->lastPage(),

                'total' =>
                    $reviews->total(),
            ],
        ]);
    }

    public function moderate(
        ModerateReviewRequest $request,
        Review $review,
    ): JsonResponse {
        $review->update([
            'status' => ReviewStatus::from(
                $request->validated('status'),
            )->value,
        ]);

        return response()->json([
            'message' =>
                'Review moderated successfully.',

            'data' => new ReviewResource(
                $review->fresh('user'),
            ),
        ]);
    }
}