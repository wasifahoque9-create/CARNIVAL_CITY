<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $recentOrders = Order::query()
            ->with(['items.product', 'shippingAddress', 'payment'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'total_orders' => Order::count(),
            'total_revenue' => (float) Order::query()
                ->whereNot('status', OrderStatus::Cancelled)
                ->sum('total_amount'),
            'total_products' => Product::query()
                ->where('status', ProductStatus::Active)
                ->count(),
            'total_customers' => User::query()
                ->where('role', UserRole::Customer)
                ->count(),
            'pending_reviews' => Review::query()
                ->where('status', ReviewStatus::Pending)
                ->count(),
            'recent_orders' => OrderResource::collection($recentOrders),
        ]);
    }

    public function reviews(Request $request): JsonResponse
    {
        $query = Review::query()
            ->with(['user', 'product'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', ReviewStatus::from($request->string('status')));
        }

        $reviews = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }
}
