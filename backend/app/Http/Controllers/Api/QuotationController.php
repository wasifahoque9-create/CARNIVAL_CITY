<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuotationRequest;
use App\Models\QuotationRequestItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QuotationController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {}

    private function getGuestToken(
        Request $request
    ): ?string {
        $token = $request->header(
            'X-Guest-Cart-Token'
        );

        return $token
            ? trim((string) $token)
            : null;
    }

    public function store(
        Request $request
    ): JsonResponse {
        $user = $request->user('sanctum');
        $guestToken =
            $this->getGuestToken($request);

        $validated = $request->validate([
            'customer_name' => [
                'required',
                'string',
                'max:150',
            ],

            'customer_email' => [
                'nullable',
                'email',
                'max:190',
            ],

            'customer_phone' => [
                'required',
                'string',
                'max:50',
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:190',
            ],

            'message' => [
                'nullable',
                'string',
                'max:3000',
            ],
        ]);

        $summary =
            $this->cartService->getCartSummary(
                $user,
                $guestToken
            );

        $cart = $summary['cart'];

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => [
                    'Cannot request a quotation with an empty cart.',
                ],
            ]);
        }

        $quotation = DB::transaction(
            function () use (
                $user,
                $validated,
                $summary,
                $cart
            ) {
                $quotation =
                    QuotationRequest::create([
                        'user_id' =>
                            $user?->id,

                        'customer_name' =>
                            $validated[
                                'customer_name'
                            ],

                        'customer_email' =>
                            $validated[
                                'customer_email'
                            ] ?? null,

                        'customer_phone' =>
                            $validated[
                                'customer_phone'
                            ],

                        'company_name' =>
                            $validated[
                                'company_name'
                            ] ?? null,

                        'message' =>
                            $validated[
                                'message'
                            ] ?? null,

                        'estimated_total' =>
                            $summary['total'],

                        'status' =>
                            'pending',
                    ]);

                foreach (
                    $cart->items as $item
                ) {
                    $variantName = null;

                    if ($item->variant) {
                        $variantName =
                            $item->variant
                                ->variant_name .
                            ': ' .
                            $item->variant
                                ->variant_value;
                    }

                    QuotationRequestItem::create([
                        'quotation_request_id' =>
                            $quotation->id,

                        'product_id' =>
                            $item->product_id,

                        'product_variant_id' =>
                            $item->product_variant_id,

                        'product_name' =>
                            $item->product?->name
                            ?? 'Product',

                        'variant_name' =>
                            $variantName,

                        'quantity' =>
                            $item->quantity,

                        'unit_price' =>
                            $item->unitPrice(),

                        'line_total' =>
                            $item->lineTotal(),
                    ]);
                }

                return $quotation;
            }
        );

        $quotation->load([
            'items.product',
            'items.variant',
            'user',
        ]);

        return response()->json([
            'message' =>
                'Quotation request submitted successfully.',

            'data' => $quotation,
        ], 201);
    }

    public function index(
        Request $request
    ): JsonResponse {
        $request->validate([
            'status' => [
                'nullable',
                Rule::in([
                    'pending',
                    'reviewed',
                    'quoted',
                    'accepted',
                    'rejected',
                ]),
            ],
        ]);

        $query =
            QuotationRequest::query()
                ->with([
                    'items.product',
                    'items.variant',
                    'user',
                ])
                ->latest();

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->string(
                    'status'
                )
            );
        }

        $quotations = $query->paginate(
            $request->integer(
                'per_page',
                20
            )
        );

        return response()->json([
            'data' => $quotations->items(),

            'meta' => [
                'current_page' =>
                    $quotations
                        ->currentPage(),

                'last_page' =>
                    $quotations
                        ->lastPage(),

                'per_page' =>
                    $quotations
                        ->perPage(),

                'total' =>
                    $quotations
                        ->total(),
            ],
        ]);
    }

    public function show(
        QuotationRequest $quotationRequest
    ): JsonResponse {
        $quotationRequest->load([
            'items.product',
            'items.variant',
            'user',
        ]);

        return response()->json([
            'data' =>
                $quotationRequest,
        ]);
    }

    public function updateStatus(
        Request $request,
        QuotationRequest $quotationRequest
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'reviewed',
                    'quoted',
                    'accepted',
                    'rejected',
                ]),
            ],

            'quoted_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'admin_note' => [
                'nullable',
                'string',
                'max:3000',
            ],
        ]);

        $quotationRequest->update([
            'status' =>
                $validated['status'],

            'quoted_amount' =>
                $validated[
                    'quoted_amount'
                ] ?? null,

            'admin_note' =>
                $validated[
                    'admin_note'
                ] ?? null,
        ]);

        $quotationRequest->load([
            'items.product',
            'items.variant',
            'user',
        ]);

        return response()->json([
            'message' =>
                'Quotation updated successfully.',

            'data' =>
                $quotationRequest,
        ]);
    }
}