# Routes to add to `routes/api.php`

Add these alongside your existing category/product routes. Exact placement depends on
your current file, but the shape is:

## 1. Imports (top of file)

```php
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
```

## 2. Public route

Add this next to your other public catalog routes (e.g. right after `/categories`):

```php
Route::get('/banners', [BannerController::class, 'index']);
```

## 3. Admin routes

Add this inside your existing admin group — the same `Route::middleware([...])->prefix('admin')->group(...)`
block that already contains `Route::apiResource('products', ...)` and `Route::apiResource('categories', ...)`:

```php
Route::apiResource('banners', AdminBannerController::class);
```

This registers:

| Method | URI                    | Action  |
|--------|------------------------|---------|
| GET    | /admin/banners         | index   |
| POST   | /admin/banners         | store   |
| GET    | /admin/banners/{banner}| show    |
| PUT    | /admin/banners/{banner}| update  |
| DELETE | /admin/banners/{banner}| destroy |

The frontend's `update()` call sends `POST` + `_method=PUT` (multipart form data, same
trick already used for product image updates), which Laravel's method-spoofing
middleware routes to `update` automatically — no extra route needed.

## 4. One-time setup commands

```bash
php artisan make:migration create_banners_table   # skip if using the provided migration file
php artisan migrate
php artisan storage:link   # exposes storage/app/public as public/storage, needed for banner images
```
