<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('users')
    ->group(function () {
        Route::get('/me', [UserController::class, 'me']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
    });

/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
*/

// Customer storefront routes.
// These routes show only active products.
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Admin product-management routes.
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/products', [
            ProductController::class,
            'adminIndex',
        ]);

        Route::get('/products/{product}', [
            ProductController::class,
            'adminShow',
        ]);

        Route::post('/products', [
            ProductController::class,
            'store',
        ]);

        Route::put('/products/{product}', [
            ProductController::class,
            'update',
        ]);

        Route::delete('/products/{product}', [
            ProductController::class,
            'destroy',
        ]);
    });
/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
*/

Route::get('/categories', [CategoryController::class, 'index']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Cart Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('cart')
    ->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'add']);
        Route::put('/update', [CartController::class, 'update']);
        Route::delete('/remove', [CartController::class, 'remove']);
    });

/*
|--------------------------------------------------------------------------
| Order Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('orders')
    ->group(function () {
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::put('/{order}/cancel', [OrderController::class, 'cancel']);
    });

Route::middleware(['auth:sanctum', 'admin'])
    ->put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('payments')
    ->group(function () {
        Route::post('/checkout', [PaymentController::class, 'checkout']);
        Route::get('/history', [PaymentController::class, 'history']);
        Route::get('/{payment}', [PaymentController::class, 'show']);
    });

/*
|--------------------------------------------------------------------------
| Review Routes
|--------------------------------------------------------------------------
*/

Route::post('/reviews', [ReviewController::class, 'store'])
    ->middleware('auth:sanctum');

Route::get('/reviews/product/{product}', [
    ReviewController::class,
    'forProduct',
]);

Route::middleware(['auth:sanctum', 'admin'])
    ->put('/reviews/{review}/moderate', [
        ReviewController::class,
        'moderate',
    ]);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/reviews', [AdminController::class, 'reviews']);
    });
   
Route::middleware('auth:sanctum')
    ->prefix('admin')
    ->group(function () {
        Route::get(
            '/products',
            [ProductController::class, 'adminIndex'],
        );

        Route::post(
            '/products',
            [ProductController::class, 'store'],
        );
    });