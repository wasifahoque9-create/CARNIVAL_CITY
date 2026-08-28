<?php

use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
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

    /*
    |--------------------------------------------------------------------------
    | Public Authentication Routes
    |--------------------------------------------------------------------------
    */

    // Register with email + password
    Route::post('/register', [
        AuthController::class,
        'register',
    ]);

    // Login with email + password
    Route::post('/login', [
        AuthController::class,
        'login',
    ]);

    // Forgot password
    Route::post('/forgot-password', [
        AuthController::class,
        'forgotPassword',
    ]);

    // Reset password
    Route::post('/reset-password', [
        AuthController::class,
        'resetPassword',
    ]);

    // Verify email
    Route::post('/verify-email', [
        AuthController::class,
        'verifyEmail',
    ]);

    // Google login / registration
    Route::post('/google', [
        AuthController::class,
        'googleLogin',
    ]);

    // Send phone OTP
    Route::post('/send-otp', [
        AuthController::class,
        'sendOtp',
    ]);

    // Verify phone OTP
    Route::post('/verify-otp', [
        AuthController::class,
        'verifyOtp',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Protected Authentication Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        // Logout current authenticated session
        Route::post('/logout', [
            AuthController::class,
            'logout',
        ]);

        /*
         * Set a local password.
         *
         * Used primarily by users who originally registered/logged in
         * through Google and currently have password_set = false.
         */
        Route::post('/set-password', [
            AuthController::class,
            'setPassword',
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

        // Current authenticated user
        Route::get('/me', [
            UserController::class,
            'me',
        ]);

        // Update profile
        Route::put('/profile', [
            UserController::class,
            'updateProfile',
        ]);

        /*
         * Change existing password.
         *
         * This should normally be used by users who already have
         * password_set = true.
         */
        Route::put('/change-password', [
            UserController::class,
            'changePassword',
        ]);
    });


/*
|--------------------------------------------------------------------------
| Banner Routes
|--------------------------------------------------------------------------
*/

// Public banner list
Route::get('/banners', [
    BannerController::class,
    'index',
]);


/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
*/

// Public products
Route::get('/products', [
    ProductController::class,
    'index',
]);

// Public single product
Route::get('/products/{product}', [
    ProductController::class,
    'show',
]);


/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
*/

// Public categories
Route::get('/categories', [
    CategoryController::class,
    'index',
]);


/*
|--------------------------------------------------------------------------
| Cart Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('cart')
    ->group(function () {

        // Get current cart
        Route::get('/', [
            CartController::class,
            'index',
        ]);

        // Add item to cart
        Route::post('/add', [
            CartController::class,
            'add',
        ]);

        // Update cart item
        Route::put('/update', [
            CartController::class,
            'update',
        ]);

        // Remove cart item
        Route::delete('/remove', [
            CartController::class,
            'remove',
        ]);
    });


/*
|--------------------------------------------------------------------------
| Order Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('orders')
    ->group(function () {

        // Create order
        Route::post('/', [
            OrderController::class,
            'store',
        ]);

        // Current user's orders
        Route::get('/', [
            OrderController::class,
            'index',
        ]);

        // Single order
        Route::get('/{order}', [
            OrderController::class,
            'show',
        ]);

        // Cancel order
        Route::put('/{order}/cancel', [
            OrderController::class,
            'cancel',
        ]);
    });


/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('payments')
    ->group(function () {

        // Checkout
        Route::post('/checkout', [
            PaymentController::class,
            'checkout',
        ]);

        // Payment history
        Route::get('/history', [
            PaymentController::class,
            'history',
        ]);

        // Single payment
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

// Create review
Route::post('/reviews', [
    ReviewController::class,
    'store',
])->middleware('auth:sanctum');

// Public product reviews
Route::get('/reviews/product/{product}', [
    ReviewController::class,
    'forProduct',
]);


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| All admin-only endpoints are protected by:
|
| - auth:sanctum
| - admin middleware
|
| Every admin route uses the /admin prefix.
|
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('admin')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            AdminController::class,
            'dashboard',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Orders
        |--------------------------------------------------------------------------
        */

        Route::put('/orders/{order}/status', [
            OrderController::class,
            'updateStatus',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Reviews
        |--------------------------------------------------------------------------
        */

        Route::get('/reviews', [
            AdminController::class,
            'reviews',
        ]);

        Route::put('/reviews/{review}/moderate', [
            ReviewController::class,
            'moderate',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Customers
        |--------------------------------------------------------------------------
        */

        Route::get('/customers', [
            AdminController::class,
            'customers',
        ]);

        Route::post('/customers', [
            AdminController::class,
            'storeCustomer',
        ]);

        Route::put('/customers/{customer}', [
            AdminController::class,
            'updateCustomer',
        ]);

        Route::delete('/customers/{customer}', [
            AdminController::class,
            'destroyCustomer',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Banners
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'banners',
            AdminBannerController::class
        );
    });