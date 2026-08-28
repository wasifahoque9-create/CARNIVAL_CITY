<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BusinessSettingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\QuotationPdfController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [
        AuthController::class,
        'register',
    ]);

    Route::post('/login', [
        AuthController::class,
        'login',
    ]);

    Route::post('/forgot-password', [
        AuthController::class,
        'forgotPassword',
    ]);

    Route::post('/verify-email', [
        AuthController::class,
        'verifyEmail',
    ]);

    Route::middleware('auth:sanctum')
        ->group(function () {
            Route::post('/logout', [
                AuthController::class,
                'logout',
            ]);
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
        Route::get('/me', [
            UserController::class,
            'me',
        ]);

        Route::put('/profile', [
            UserController::class,
            'updateProfile',
        ]);

        Route::put('/change-password', [
            UserController::class,
            'changePassword',
        ]);
    });

/*
|--------------------------------------------------------------------------
| Business Settings Routes
|--------------------------------------------------------------------------
*/

Route::get('/business-settings', [
    BusinessSettingController::class,
    'show',
]);

Route::middleware([
    'auth:sanctum',
    'admin',
])->put('/admin/business-settings', [
    BusinessSettingController::class,
    'update',
]);

/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
*/

// Public storefront
Route::get('/products', [
    ProductController::class,
    'index',
]);

Route::get('/products/{product}', [
    ProductController::class,
    'show',
]);

// Admin product management
Route::middleware([
    'auth:sanctum',
    'admin',
])
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

Route::get('/categories', [
    CategoryController::class,
    'index',
]);

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->group(function () {
        Route::post('/categories', [
            CategoryController::class,
            'store',
        ]);

        Route::put('/categories/{category}', [
            CategoryController::class,
            'update',
        ]);

        Route::delete('/categories/{category}', [
            CategoryController::class,
            'destroy',
        ]);
    });

/*
|--------------------------------------------------------------------------
| Cart Routes
|--------------------------------------------------------------------------
|
| Guest and logged-in customers can use the cart.
| Guests are identified by X-Guest-Cart-Token.
|
*/

Route::prefix('cart')
    ->group(function () {
        Route::get('/', [
            CartController::class,
            'index',
        ]);

        Route::post('/add', [
            CartController::class,
            'add',
        ]);

        Route::put('/update', [
            CartController::class,
            'update',
        ]);

        Route::delete('/remove', [
            CartController::class,
            'remove',
        ]);

        Route::delete('/clear', [
            CartController::class,
            'clear',
        ]);
    });

/*
|--------------------------------------------------------------------------
| Order Routes
|--------------------------------------------------------------------------
*/

// Guest + logged-in customer checkout
Route::post('/orders', [
    OrderController::class,
    'store',
]);

// Authenticated customer order management
Route::middleware('auth:sanctum')
    ->prefix('orders')
    ->group(function () {
        Route::get('/', [
            OrderController::class,
            'index',
        ]);

        Route::get('/{order}', [
            OrderController::class,
            'show',
        ]);

        Route::put('/{order}/cancel', [
            OrderController::class,
            'cancel',
        ]);
    });

// Admin order status update
Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->put('/orders/{order}/status', [
        OrderController::class,
        'updateStatus',
    ]);

/*
|--------------------------------------------------------------------------
| Invoice Routes
|--------------------------------------------------------------------------
|
| Access is checked inside InvoiceController.
|
| Supports:
| - Logged-in order owner
| - Admin
| - Guest with matching guest cart token
|
*/

Route::get('/orders/{order}/invoice', [
    InvoiceController::class,
    'download',
]);

/*
|--------------------------------------------------------------------------
| Quotation Routes
|--------------------------------------------------------------------------
*/

// Guest + logged-in quotation request
Route::post('/quotations', [
    QuotationController::class,
    'store',
]);

// Admin quotation management
Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('admin/quotations')
    ->group(function () {
        Route::get('/', [
            QuotationController::class,
            'index',
        ]);

        Route::get('/{quotationRequest}', [
            QuotationController::class,
            'show',
        ]);

        Route::put('/{quotationRequest}', [
            QuotationController::class,
            'updateStatus',
        ]);

        Route::get('/{quotationRequest}/pdf', [
            QuotationPdfController::class,
            'download',
        ]);
    });

/*
|--------------------------------------------------------------------------
| Customer Quotation PDF
|--------------------------------------------------------------------------
|
| Logged-in quotation owner can download their quotation PDF.
| Authorization is checked inside QuotationPdfController.
|
*/

Route::middleware('auth:sanctum')
    ->get('/quotations/{quotationRequest}/pdf', [
        QuotationPdfController::class,
        'download',
    ]);

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('payments')
    ->group(function () {
        Route::post('/checkout', [
            PaymentController::class,
            'checkout',
        ]);

        Route::get('/history', [
            PaymentController::class,
            'history',
        ]);

        Route::get('/{payment}', [
            PaymentController::class,
            'show',
        ]);
    });

/*
|--------------------------------------------------------------------------
| Review Routes
|--------------------------------------------------------------------------
*/

// Authenticated customer review
Route::post('/reviews', [
    ReviewController::class,
    'store',
])->middleware('auth:sanctum');

// Public product reviews
Route::get('/reviews/product/{product}', [
    ReviewController::class,
    'forProduct',
]);

// Admin review moderation
Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->put('/reviews/{review}/moderate', [
        ReviewController::class,
        'moderate',
    ]);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [
            AdminController::class,
            'dashboard',
        ]);

        Route::get('/reviews', [
            AdminController::class,
            'reviews',
        ]);
    });

Route::get('/banners', [BannerController::class, 'index']);
