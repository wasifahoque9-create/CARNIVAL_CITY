<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreCustomerRequest;
use App\Http\Requests\Api\Admin\UpdateCustomerRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\UserResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
            $status = ReviewStatus::tryFrom($request->string('status')->toString());

            if ($status === null) {
                return response()->json([
                    'message' => 'Invalid status filter.',
                ], 422);
            }

            $query->where('status', $status);
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

    public function customers(Request $request): JsonResponse
    {
        $customers = User::query()
            ->where('role', UserRole::Customer)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => UserResource::collection($customers),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function storeCustomer(StoreCustomerRequest $request): JsonResponse
    {
        $customer = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->input('phone'),
            'password' => Hash::make($request->string('password')),
            'email_verified_at' => now(),
            'role' => UserRole::Customer,
        ]);

        return response()->json([
            'message' => 'Customer created successfully.',
            'customer' => new UserResource($customer),
        ], 201);
    }

    public function updateCustomer(UpdateCustomerRequest $request, User $customer): JsonResponse
    {
        $customer->update([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->input('phone'),
        ]);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'customer' => new UserResource($customer),
        ]);
    }

    public function destroyCustomer(User $customer): JsonResponse
    {
        if ($customer->role === UserRole::Admin) {
            return response()->json(['message' => 'Cannot delete an admin account.'], 403);
        }

        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully.']);
    }
}