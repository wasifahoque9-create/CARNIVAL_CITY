<?php

namespace App\Http\Controllers\Api;

use Cloudinary\Cloudinary;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Product\StoreProductRequest;
use App\Http\Requests\Api\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;



use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use Throwable;

class ProductController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Display products
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with([
                'category',
                'categories',
                'images',
                'variants',
                'approvedReviews',
            ])
            ->withCount('approvedReviews')
            ->where(
                'status',
                ProductStatus::Active->value,
            );

        /*
        |--------------------------------------------------------------------------
        | Search products
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->query('search', ''),
        );

        if ($search !== '') {
            $query->where(
                function ($productQuery) use ($search) {
                    $productQuery
                        ->where(
                            'name',
                            'like',
                            "%{$search}%",
                        )
                        ->orWhere(
                            'description',
                            'like',
                            "%{$search}%",
                        )
                        ->orWhere(
                            'brand',
                            'like',
                            "%{$search}%",
                        )
                        ->orWhere(
                            'sku',
                            'like',
                            "%{$search}%",
                        );
                },
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Filter by category ID
        |--------------------------------------------------------------------------
        */

        if ($request->filled('category_id')) {
            $categoryId = (int) $request->query(
                'category_id',
            );

            $query->where(
                function ($productQuery) use ($categoryId) {
                    $productQuery
                        ->where(
                            'category_id',
                            $categoryId,
                        )
                        ->orWhereHas(
                            'categories',
                            function ($categoryQuery) use (
                                $categoryId
                            ) {
                                $categoryQuery->where(
                                    'categories.id',
                                    $categoryId,
                                );
                            },
                        );
                },
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Filter by category slug
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | /api/products?category_slug=accessories
        |
        */

        $categorySlug = trim(
            (string) $request->query(
                'category_slug',
                '',
            ),
        );

        if ($categorySlug !== '') {
            $query->where(
                function ($productQuery) use (
                    $categorySlug
                ) {
                    /*
                     * Check the main category_id relationship.
                     */

                    $productQuery
                        ->whereHas(
                            'category',
                            function ($categoryQuery) use (
                                $categorySlug
                            ) {
                                $categoryQuery->where(
                                    'categories.slug',
                                    $categorySlug,
                                );
                            },
                        )

                        /*
                         * Also check the many-to-many
                         * category_product relationship.
                         */

                        ->orWhereHas(
                            'categories',
                            function ($categoryQuery) use (
                                $categorySlug
                            ) {
                                $categoryQuery->where(
                                    'categories.slug',
                                    $categorySlug,
                                );
                            },
                        );
                },
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Minimum price filter
        |--------------------------------------------------------------------------
        */

        $minPrice = $request->query('min_price');

        if (
            $request->filled('min_price') &&
            is_numeric($minPrice)
        ) {
            $query->whereRaw(
                'COALESCE(discount_price, price) >= ?',
                [(float) $minPrice],
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Maximum price filter
        |--------------------------------------------------------------------------
        */

        $maxPrice = $request->query('max_price');

        if (
            $request->filled('max_price') &&
            is_numeric($maxPrice)
        ) {
            $query->whereRaw(
                'COALESCE(discount_price, price) <= ?',
                [(float) $maxPrice],
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $perPage = max(
            1,
            min(
                $request->integer('per_page', 15),
                100,
            ),
        );

        $products = $query
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection(
                $products,
            ),

            'meta' => [
                'current_page' =>
                    $products->currentPage(),

                'last_page' =>
                    $products->lastPage(),

                'per_page' =>
                    $products->perPage(),

                'total' =>
                    $products->total(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Display one product
    |--------------------------------------------------------------------------
    */
    public function adminIndex(Request $request): JsonResponse
{
    $query = Product::query()
        ->with([
            'category',
            'categories',
            'images',
            'variants',
            'approvedReviews',
        ])
        ->withCount('approvedReviews');

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    $search = trim(
        (string) $request->query('search', ''),
    );

    if ($search !== '') {
        $query->where(function ($productQuery) use ($search) {
            $productQuery
                ->where('name', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere(
                    'description',
                    'like',
                    "%{$search}%",
                );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Status filter
    |--------------------------------------------------------------------------
    */

    $status = trim(
        (string) $request->query('status', ''),
    );

    if ($status !== '') {
        $query->where('status', $status);
    }

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    $allowedSortFields = [
        'id',
        'name',
        'price',
        'stock_qty',
        'created_at',
        'updated_at',
    ];

    $sortBy = (string) $request->query(
        'sort_by',
        'created_at',
    );

    if (!in_array($sortBy, $allowedSortFields, true)) {
        $sortBy = 'created_at';
    }

    $sortDirection = strtolower(
        (string) $request->query(
            'sort_direction',
            'desc',
        ),
    );

    if (!in_array($sortDirection, ['asc', 'desc'], true)) {
        $sortDirection = 'desc';
    }

    $perPage = max(
        1,
        min(
            $request->integer('per_page', 15),
            100,
        ),
    );

    $products = $query
        ->orderBy($sortBy, $sortDirection)
        ->paginate($perPage);

    return response()->json([
        'data' => ProductResource::collection(
            $products,
        ),

        'meta' => [
            'current_page' =>
                $products->currentPage(),

            'last_page' =>
                $products->lastPage(),

            'per_page' =>
                $products->perPage(),

            'total' =>
                $products->total(),
        ],
    ]);
}

    public function show(
        Product $product,
    ): JsonResponse {
        $product->load([
            'category',
            'categories',
            'images',
            'variants',
            'approvedReviews',
        ]);

        $product->loadCount(
            'approvedReviews',
        );

        return response()->json([
            'data' => new ProductResource(
                $product,
            ),
        ]);
    }

    /*

    
    |--------------------------------------------------------------------------
    | Create product
    |--------------------------------------------------------------------------
    */
public function store(
    StoreProductRequest $request,
): JsonResponse {
    $data = $request->validated();

    $storedImagePaths = [];

    DB::beginTransaction();

    try {
        /*
        |--------------------------------------------------------------------------
        | Create a unique slug
        |--------------------------------------------------------------------------
        */

        $baseSlug = Str::slug($data['name']);

        if ($baseSlug === '') {
            $baseSlug = 'product';
        }

        $slug = $baseSlug;
        $number = 2;

        while (
            Product::query()
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$number;
            $number++;
        }

        /*
        |--------------------------------------------------------------------------
        | Create product
        |--------------------------------------------------------------------------
        */

        $product = Product::query()->create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $data['sku'],
            'brand' => $data['brand'] ?? null,
            'price' => $data['price'],
            'stock_qty' => $data['stock_qty'],
            'description' => $data['description'],
            'status' => $data['status'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Save product images
        |--------------------------------------------------------------------------
        */

        $uploadedImages = $request->file(
            'images',
            [],
        );

        foreach (
            $uploadedImages as $index => $image
        ) {
            $imagePath = $this->uploadProductImage($image);

            $storedImagePaths[] = $imagePath;

            $product->images()->create([
                'image_path' => $imagePath,
                'alt_text' => $product->name,
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }

        DB::commit();

        $product->load([
            'category',
            'images',
            'primaryImage',
        ]);

        return response()->json([
            'message' =>
                'Product created successfully.',

            'data' => [
                'id' => $product->id,
                'category_id' =>
                    $product->category_id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'brand' => $product->brand,
                'price' => $product->price,
                'stock_qty' =>
                    $product->stock_qty,
                'description' =>
                    $product->description,
                'status' => $product->status,
                'category' =>
                    $product->category,

                'image_url' =>
                    $product->primaryImage?->url,

                'images' =>
                    $product->images->map(
                        function ($productImage) {
                            return [
                                'id' =>
                                    $productImage->id,

                                'image_path' =>
                                    $productImage
                                        ->image_path,

                                'url' =>
                                    $productImage->url,

                                'alt_text' =>
                                    $productImage
                                        ->alt_text,

                                'is_primary' =>
                                    $productImage
                                        ->is_primary,

                                'sort_order' =>
                                    $productImage
                                        ->sort_order,
                            ];
                        },
                    ),
            ],
        ], 201);
    } catch (Throwable $exception) {
        DB::rollBack();

        foreach ($storedImagePaths as $imagePath) {
            Storage::disk('public')->delete(
                $imagePath,
            );
        }

        report($exception);

        return response()->json([
            'message' =>
                'Product could not be created.',

            'error' => config('app.debug')
                ? $exception->getMessage()
                : null,
        ], 500);
    }
}

    /*
    |--------------------------------------------------------------------------
    | Update product
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateProductRequest $request,
        Product $product,
    ): JsonResponse {
        $data = $request->validated();

        /*
         * Remove relationship fields before updating
         * the products table.
         */

        $product->update(
            collect($data)
                ->except([
                    'category_ids',
                    'images',
                    'variants',
                ])
                ->toArray(),
        );

        /*
         * Only update category relations when
         * category_ids were included in the request.
         */

        if (
            array_key_exists(
                'category_ids',
                $data,
            )
        ) {
            $this->syncCategories(
                $product,
                $data,
            );
        }

        $product->load([
            'category',
            'categories',
            'images',
            'variants',
            'approvedReviews',
        ]);

        $product->loadCount(
            'approvedReviews',
        );

        return response()->json([
            'message' =>
                'Product updated successfully.',

            'data' =>
                new ProductResource($product),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Archive product
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Product $product,
    ): JsonResponse {
        $product->update([
            'status' =>
                ProductStatus::Archived->value,
        ]);

        return response()->json([
            'message' =>
                'Product archived successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Synchronize product categories
    |--------------------------------------------------------------------------
    */

    private function syncCategories(
        Product $product,
        array $data,
    ): void {
        $categoryIds =
            $data['category_ids'] ?? [];

        /*
         * Add the primary category to the
         * category_product pivot table.
         */

        if (! empty($data['category_id'])) {
            $categoryIds[] =
                (int) $data['category_id'];
        } elseif ($product->category_id) {
            $categoryIds[] =
                (int) $product->category_id;
        }

        /*
         * Remove empty and duplicate IDs.
         */

        $categoryIds = array_values(
            array_unique(
                array_filter(
                    array_map(
                        'intval',
                        $categoryIds,
                    ),
                ),
            ),
        );

        $product
            ->categories()
            ->sync($categoryIds);
    }
    private function buildProductImageUrl(?string $imagePath): string
    {
        if (! $imagePath) {
            return '';
        }

        $imagePath = trim($imagePath);

        if (preg_match('/^https?:\/\//i', $imagePath)) {
            return $imagePath;
        }

        return rtrim(config('app.url'), '/') . '/storage/' . ltrim($imagePath, '/');
    }

    private function uploadProductImage($image): string
    {
        $cloudinaryUrl = env('CLOUDINARY_URL');

        if (! $cloudinaryUrl) {
            return $image->store('products', 'public');
        }

        $cloudinary = new Cloudinary($cloudinaryUrl);

        $uploadedFile = $cloudinary->uploadApi()->upload(
            $image->getRealPath(),
            [
                'folder' => 'shopsphere/products',
                'resource_type' => 'image',
            ]
        );

        return $uploadedFile['secure_url'];
    }


    /*
    |--------------------------------------------------------------------------
    | Create product images
    |--------------------------------------------------------------------------
    */

    private function syncImages(
        Product $product,
        array $images,
    ): void {
        foreach ($images as $image) {
            $product
                ->images()
                ->create($image);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create product variants
    |--------------------------------------------------------------------------
    */

    private function syncVariants(
        Product $product,
        array $variants,
    ): void {
        foreach ($variants as $variant) {
            $product
                ->variants()
                ->create($variant);
        }
    }
}