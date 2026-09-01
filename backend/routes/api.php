<?php

use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
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
// Public categories
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

/*
|--------------------------------------------------------------------------
| Guest Order Tracking
|--------------------------------------------------------------------------
|
| Guest customers can view only their own order.
| OrderController verifies X-Guest-Cart-Token against
| the guest_token stored with the order.
|
*/

Route::get('/guest/orders/{order}', [
    OrderController::class,
    'guestShow',
]);

/*
|--------------------------------------------------------------------------
| Authenticated Customer Order Management
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
| Admin Order Management
|--------------------------------------------------------------------------
|
| Admin can:
|
| - Update normal order status
| - Update delivery tracking information
|
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('orders')
    ->group(function () {
        /*
         * Pending
         *      ↓
         * Accepted
         *      ↓
         * Shipped
         *      ↓
         * Delivered
         */
        Route::put('/{order}/status', [
            OrderController::class,
            'updateStatus',
        ]);

        /*
         * Delivery Tracking
         *
         * Home Delivery only.
         *
         * Shipped
         *      ↓
         * In Transit
         *      ↓
         * Out for Delivery
         *      ↓
         * Delivered
         */
        Route::put('/{order}/delivery-tracking', [
            OrderController::class,
            'updateDeliveryTracking',
        ]);
    });

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
    });

Route::get('/banners', [BannerController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Admin Banner Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('admin')
    ->group(function () {
        Route::get('/banners', [
            BannerController::class,
            'adminIndex',
        ]);

        Route::post('/banners', [
            BannerController::class,
            'store',
        ]);

        Route::put('/banners/{banner}', [
            BannerController::class,
            'update',
        ]);

        Route::delete('/banners/{banner}', [
            BannerController::class,
            'destroy',
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
    });