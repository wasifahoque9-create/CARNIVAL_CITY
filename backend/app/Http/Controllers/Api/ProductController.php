<?php 
 
namespace App\Http\Controllers\Api; 
 
use Cloudinary\Cloudinary; 
 
use App\Enums\ProductStatus; 
use App\Http\Controllers\Controller; 
use App\Http\Requests\Api\Product\StoreProductRequest; 
use App\Http\Requests\Api\Product\UpdateProductRequest; 
use App\Http\Resources\ProductResource; 
use App\Models\Category; 
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
                'images', 
                'variants', 
                'approvedReviews', 
            ]) 
            ->withCount('approvedReviews') 
            ->withAvg('approvedReviews', 'rating') 
            ->where( 
                'status', 
                ProductStatus::Active->value 
            ); 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Search products 
        |-------------------------------------------------------------------------- 
        */ 
 
        $search = trim( 
            (string) $request->query('search', '') 
        ); 
 
        if ($search !== '') { 
            $query->where(function ($productQuery) use ($search) { 
                $productQuery 
                    ->where( 
                        'name', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'description', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'brand', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'sku', 
                        'like', 
                        "%{$search}%" 
                    ); 
            }); 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Filter by category ID 
        |-------------------------------------------------------------------------- 
        | 
        | Products belong to subcategories. 
        | 
        | If category_id is a main category: 
        |     return products from the main category 
        |     and all of its direct subcategories. 
        | 
        | If category_id is a subcategory: 
        |     return products from that subcategory only. 
        | 
        */ 
 
        if ($request->filled('category_id')) { 
            $categoryId = (int) $request->query( 
                'category_id' 
            ); 
 
            $category = Category::query() 
                ->with('subcategories:id,parent_id') 
                ->find($categoryId); 
 
            if (!$category) { 
                $query->whereRaw('1 = 0'); 
            } elseif ($category->isMainCategory()) { 
                $categoryIds = collect([$category->id]) 
                    ->merge( 
                        $category->subcategories->pluck('id') 
                    ) 
                    ->unique() 
                    ->values(); 
 
                $query->whereIn( 
                    'category_id', 
                    $categoryIds 
                ); 
            } else { 
                $query->where( 
                    'category_id', 
                    $category->id 
                ); 
            } 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Filter by category slug 
        |-------------------------------------------------------------------------- 
        | 
        | If the slug belongs to a MAIN CATEGORY: 
        | 
        |     return products from that main category 
        |     and all of its subcategories. 
        | 
        | If the slug belongs to a SUBCATEGORY: 
        | 
        |     return products from that subcategory only. 
        | 
        */ 
 
        $categorySlug = trim( 
            (string) $request->query( 
                'category_slug', 
                '' 
            ) 
        ); 
 
        if ($categorySlug !== '') { 
            $category = Category::query() 
                ->with('subcategories:id,parent_id') 
                ->where( 
                    'slug', 
                    $categorySlug 
                ) 
                ->first(); 
 
            /* 
             * If the requested category does not exist, 
             * return no products. 
             */ 
            if (!$category) { 
                $query->whereRaw('1 = 0'); 
            } 
 
            /* 
             * Main category: 
             * 
             * Include the main category ID and every 
             * direct subcategory ID. 
             */ 
            elseif ($category->isMainCategory()) { 
                $categoryIds = collect([$category->id]) 
                    ->merge( 
                        $category->subcategories->pluck('id') 
                    ) 
                    ->unique() 
                    ->values(); 
 
                $query->whereIn( 
                    'category_id', 
                    $categoryIds 
                ); 
            } 
 
            /* 
             * Subcategory: 
             * 
             * Only products directly assigned to this 
             * subcategory are returned. 
             */ 
            else { 
                $query->where( 
                    'category_id', 
                    $category->id 
                ); 
            } 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Minimum effective price 
        |-------------------------------------------------------------------------- 
        */ 
 
        $minPrice = $request->query('min_price'); 
 
        if ( 
            $request->filled('min_price') && 
            is_numeric($minPrice) 
        ) { 
            $query->whereRaw( 
                'COALESCE(discount_price, price) >= ?', 
                [(float) $minPrice] 
            ); 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Maximum effective price 
        |-------------------------------------------------------------------------- 
        */ 
 
        $maxPrice = $request->query('max_price'); 
 
        if ( 
            $request->filled('max_price') && 
            is_numeric($maxPrice) 
        ) { 
            $query->whereRaw( 
                'COALESCE(discount_price, price) <= ?', 
                [(float) $maxPrice] 
            ); 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Brand 
        |-------------------------------------------------------------------------- 
        */ 
 
        $brand = trim( 
            (string) $request->query('brand', '') 
        ); 
 
        if ($brand !== '') { 
            $query->where( 
                'brand', 
                $brand 
            ); 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Customer sorting 
        |-------------------------------------------------------------------------- 
        | 
        | Supported frontend values: 
        | 
        |     newest 
        |     name 
        |     price_asc 
        |     price_desc 
        |     rating 
        | 
        | Invalid values safely fall back to newest. 
        | 
        */ 
 
        $sort = (string) $request->query( 
            'sort', 
            'newest' 
        ); 
 
        switch ($sort) { 
            case 'name': 
                $query 
                    ->orderBy('name', 'asc') 
                    ->orderBy('id', 'desc'); 
                break; 
 
            case 'price_asc': 
                $query 
                    ->orderByRaw( 
                        'COALESCE(discount_price, price) ASC' 
                    ) 
                    ->orderBy('id', 'desc'); 
                break; 
 
            case 'price_desc': 
                $query 
                    ->orderByRaw( 
                        'COALESCE(discount_price, price) DESC' 
                    ) 
                    ->orderBy('id', 'desc'); 
                break; 
 
            case 'rating': 
                $query 
                    ->orderByRaw( 
                        'COALESCE(approved_reviews_avg_rating, 0) DESC' 
                    ) 
                    ->orderByDesc('approved_reviews_count') 
                    ->orderByDesc('id'); 
                break; 
 
            case 'newest': 
            default: 
                $query 
                    ->orderByDesc('created_at') 
                    ->orderByDesc('id'); 
                break; 
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
                100 
            ) 
        ); 
 
        $products = $query 
            ->paginate($perPage); 
 
        return response()->json([ 
            'data' => ProductResource::collection( 
                $products 
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
    | Display products for admin 
    |-------------------------------------------------------------------------- 
    */ 
 
    public function adminIndex(Request $request): JsonResponse 
    { 
        $query = Product::query() 
            ->with([ 
                'category', 
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
            (string) $request->query('search', '') 
        ); 
 
        if ($search !== '') { 
            $query->where(function ($productQuery) use ($search) { 
                $productQuery 
                    ->where( 
                        'name', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'brand', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'sku', 
                        'like', 
                        "%{$search}%" 
                    ) 
                    ->orWhere( 
                        'description', 
                        'like', 
                        "%{$search}%" 
                    ); 
            }); 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Status filter 
        |-------------------------------------------------------------------------- 
        */ 
 
        $status = trim( 
            (string) $request->query('status', '') 
        ); 
 
        if ($status !== '') { 
            $query->where( 
                'status', 
                $status 
            ); 
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
            'created_at' 
        ); 
 
        if (!in_array( 
            $sortBy, 
            $allowedSortFields, 
            true 
        )) { 
            $sortBy = 'created_at'; 
        } 
 
        $sortDirection = strtolower( 
            (string) $request->query( 
                'sort_direction', 
                'desc' 
            ) 
        ); 
 
        if (!in_array( 
            $sortDirection, 
            ['asc', 'desc'], 
            true 
        )) { 
            $sortDirection = 'desc'; 
        } 
 
        $perPage = max( 
            1, 
            min( 
                $request->integer('per_page', 15), 
                100 
            ) 
        ); 
 
        $products = $query 
            ->orderBy( 
                $sortBy, 
                $sortDirection 
            ) 
            ->paginate($perPage); 
 
        return response()->json([ 
            'data' => ProductResource::collection( 
                $products 
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
 
    public function show( 
        Product $product 
    ): JsonResponse { 
        $product->load([ 
            'category', 
            'images', 
            'variants', 
            'approvedReviews', 
        ]); 
 
        $product->loadCount( 
            'approvedReviews' 
        ); 
 
        return response()->json([ 
            'data' => new ProductResource( 
                $product 
            ), 
        ]); 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Display one product for admin 
    |-------------------------------------------------------------------------- 
    */ 
 
    public function adminShow( 
        Product $product 
    ): JsonResponse { 
        $product->load([ 
            'category', 
            'images', 
            'variants', 
            'approvedReviews', 
        ]); 
 
        $product->loadCount( 
            'approvedReviews' 
        ); 
 
        return response()->json([ 
            'data' => new ProductResource( 
                $product 
            ), 
        ]); 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Create product 
    |-------------------------------------------------------------------------- 
    */ 
 
    public function store( 
        StoreProductRequest $request 
    ): JsonResponse { 
        $data = $request->validated(); 
 
        $storedImagePaths = []; 
        $storedThumbnailPaths = []; 
 
        DB::beginTransaction(); 
 
        try { 
            /* 
            |-------------------------------------------------------------------------- 
            | Create unique slug 
            |-------------------------------------------------------------------------- 
            */ 
 
            $baseSlug = Str::slug( 
                $data['name'] 
            ); 
 
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
                $slug = $baseSlug . '-' . $number; 
                $number++; 
            } 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Create product 
            |-------------------------------------------------------------------------- 
            | 
            | category_id must be a SUBCATEGORY. 
            | 
            | StoreProductRequest already validates this. 
            | 
            */ 
 
            $product = Product::query()->create([ 
                'category_id' => 
                    $data['category_id'], 
 
                'name' => 
                    $data['name'], 
 
                'slug' => 
                    $slug, 
 
                'sku' => 
                    $data['sku'], 
 
                'brand' => 
                    $data['brand'] ?? null, 
 
                'price' => 
                    $data['price'], 
 
                'discount_price' => 
                    $data['discount_price'] ?? null, 
 
                'stock_qty' => 
                    $data['stock_qty'], 
 
                'description' => 
                    $data['description'] ?? null, 
 
                'status' => 
                    $data['status'], 
 
                'specifications' => 
                    $data['specifications'] ?? null, 
 
                'warranty_months' => 
                    $data['warranty_months'] ?? null, 
            ]); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Save product images 
            |-------------------------------------------------------------------------- 
            */ 
 
            $uploadedImages = $request->file( 
                'images', 
                [] 
            ); 
 
            foreach ( 
                $uploadedImages as $index => $image 
            ) { 
                $uploaded = $this->uploadProductImage( 
                    $image 
                ); 
 
                $imagePath = 
                    $uploaded['image_path']; 
 
                $thumbnailPath = 
                    $uploaded['thumbnail_path']; 
 
                $storedImagePaths[] = 
                    $imagePath; 
 
                if ($thumbnailPath) { 
                    $storedThumbnailPaths[] = 
                        $thumbnailPath; 
                } 
 
                $product->images()->create([ 
                    'image_path' => 
                        $imagePath, 
 
                    'thumbnail_path' => 
                        $thumbnailPath, 
 
                    'alt_text' => 
                        $product->name, 
 
                    'is_primary' => 
                        $index === 0, 
 
                    'sort_order' => 
                        $index, 
                ]); 
            } 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Save variants 
            |-------------------------------------------------------------------------- 
            */ 
 
            if ( 
                array_key_exists( 
                    'variants', 
                    $data 
                ) 
            ) { 
                $this->syncVariants( 
                    $product, 
                    $data['variants'] ?? [] 
                ); 
            } 
 
            DB::commit(); 
 
            $product->load([ 
                'category', 
                'images', 
                'variants', 
                'primaryImage', 
            ]); 
 
            return response()->json([ 
                'message' => 
                    'Product created successfully.', 
 
                'data' => 
                    new ProductResource( 
                        $product 
                    ), 
            ], 201); 
        } catch (Throwable $exception) { 
            DB::rollBack(); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Delete uploaded files if creation failed 
            |-------------------------------------------------------------------------- 
            */ 
 
            foreach ($storedImagePaths as $imagePath) { 
                $this->deleteImageFile( 
                    $imagePath 
                ); 
            } 
 
            foreach ($storedThumbnailPaths as $thumbnailPath) { 
                $this->deleteImageFile( 
                    $thumbnailPath 
                ); 
            } 
 
            report($exception); 
 
            return response()->json([ 
                'message' => 
                    'Product could not be created.', 
 
                'error' => 
                    config('app.debug') 
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
        Product $product 
    ): JsonResponse { 
        $data = $request->validated(); 
 
        $storedImagePaths = []; 
        $storedThumbnailPaths = []; 
 
        DB::beginTransaction(); 
 
        try { 
            /* 
            |-------------------------------------------------------------------------- 
            | Update product information 
            |-------------------------------------------------------------------------- 
            */ 
 
            $product->update( 
                collect($data) 
                    ->except([ 
                        'images', 
                        'variants', 
                    ]) 
                    ->toArray() 
            ); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Replace product images 
            |-------------------------------------------------------------------------- 
            */ 
 
            if ($request->hasFile('images')) { 
                /* 
                 * Get existing images first. 
                 */ 
                $oldImages = $product 
                    ->images() 
                    ->get(); 
 
                /* 
                 * Delete old image database records. 
                 */ 
                $product->images()->delete(); 
 
                /* 
                 * Upload new images. 
                 */ 
                $uploadedImages = $request->file( 
                    'images', 
                    [] 
                ); 
 
                foreach ( 
                    $uploadedImages as $index => $image 
                ) { 
                    $uploaded = 
                        $this->uploadProductImage( 
                            $image 
                        ); 
 
                    $imagePath = 
                        $uploaded['image_path']; 
 
                    $thumbnailPath = 
                        $uploaded['thumbnail_path']; 
 
                    $storedImagePaths[] = 
                        $imagePath; 
 
                    if ($thumbnailPath) { 
                        $storedThumbnailPaths[] = 
                            $thumbnailPath; 
                    } 
 
                    $product->images()->create([ 
                        'image_path' => 
                            $imagePath, 
 
                        'thumbnail_path' => 
                            $thumbnailPath, 
 
                        'alt_text' => 
                            $product->name, 
 
                        'is_primary' => 
                            $index === 0, 
 
                        'sort_order' => 
                            $index, 
                    ]); 
                } 
 
                /* 
                 * Delete old physical files. 
                 */ 
                foreach ($oldImages as $oldImage) { 
                    $this->deleteImageFile( 
                        $oldImage->image_path 
                    ); 
 
                    $this->deleteImageFile( 
                        $oldImage->thumbnail_path 
                    ); 
                } 
            } 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Update variants 
            |-------------------------------------------------------------------------- 
            */ 
 
            if ( 
                array_key_exists( 
                    'variants', 
                    $data 
                ) 
            ) { 
                $product->variants()->delete(); 
 
                $this->syncVariants( 
                    $product, 
                    $data['variants'] ?? [] 
                ); 
            } 
 
            DB::commit(); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Load updated product 
            |-------------------------------------------------------------------------- 
            */ 
 
            $product->load([ 
                'category', 
                'images', 
                'variants', 
                'approvedReviews', 
            ]); 
 
            $product->loadCount( 
                'approvedReviews' 
            ); 
 
            return response()->json([ 
                'message' => 
                    'Product updated successfully.', 
 
                'data' => 
                    new ProductResource( 
                        $product 
                    ), 
            ]); 
        } catch (Throwable $exception) { 
            DB::rollBack(); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Delete newly uploaded files if update failed 
            |-------------------------------------------------------------------------- 
            */ 
 
            foreach ($storedImagePaths as $imagePath) { 
                $this->deleteImageFile( 
                    $imagePath 
                ); 
            } 
 
            foreach ($storedThumbnailPaths as $thumbnailPath) { 
                $this->deleteImageFile( 
                    $thumbnailPath 
                ); 
            } 
 
            report($exception); 
 
            return response()->json([ 
                'message' => 
                    'Product could not be updated.', 
 
                'error' => 
                    config('app.debug') 
                        ? $exception->getMessage() 
                        : null, 
            ], 500); 
        } 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Permanently delete product 
    |-------------------------------------------------------------------------- 
    */ 
 
    public function destroy( 
        Product $product 
    ): JsonResponse { 
        DB::beginTransaction(); 
 
        try { 
            /* 
            |-------------------------------------------------------------------------- 
            | Delete product image files 
            |-------------------------------------------------------------------------- 
            */ 
 
            $images = $product 
                ->images() 
                ->get(); 
 
            foreach ($images as $image) { 
                $this->deleteImageFile( 
                    $image->image_path 
                ); 
 
                $this->deleteImageFile( 
                    $image->thumbnail_path 
                ); 
            } 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Delete related records 
            |-------------------------------------------------------------------------- 
            */ 
 
            $product->images()->delete(); 
 
            $product->variants()->delete(); 
 
            /* 
            |-------------------------------------------------------------------------- 
            | Delete product 
            |-------------------------------------------------------------------------- 
            */ 
 
            $product->delete(); 
 
            DB::commit(); 
 
            return response()->json([ 
                'message' => 
                    'Product deleted successfully.', 
            ]); 
        } catch (Throwable $exception) { 
            DB::rollBack(); 
 
            report($exception); 
 
            return response()->json([ 
                'message' => 
                    'Product could not be deleted.', 
 
                'error' => 
                    config('app.debug') 
                        ? $exception->getMessage() 
                        : null, 
            ], 500); 
        } 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Upload product image 
    |-------------------------------------------------------------------------- 
    */ 
 
    private function uploadProductImage($image): array 
    { 
        $cloudinaryUrl = env( 
            'CLOUDINARY_URL' 
        ); 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Cloudinary 
        |-------------------------------------------------------------------------- 
        */ 
 
        if ($cloudinaryUrl) { 
            $cloudinary = new Cloudinary( 
                $cloudinaryUrl 
            ); 
 
            $uploadedFile = $cloudinary 
                ->uploadApi() 
                ->upload( 
                    $image->getRealPath(), 
                    [ 
                        'folder' => 
                            'shopsphere/products', 
 
                        'resource_type' => 
                            'image', 
 
                        'eager' => [ 
                            [ 
                                'width' => 
                                    500, 
 
                                'height' => 
                                    500, 
 
                                'crop' => 
                                    'fill', 
 
                                'gravity' => 
                                    'auto', 
 
                                'format' => 
                                    'jpg', 
                            ], 
                        ], 
                    ] 
                ); 
 
            $thumbnailPath = null; 
 
            if ( 
                isset( 
                    $uploadedFile['eager'] 
                ) && 
                !empty( 
                    $uploadedFile['eager'][0]['secure_url'] 
                ) 
            ) { 
                $thumbnailPath = 
                    $uploadedFile['eager'][0]['secure_url']; 
            } 
 
            return [ 
                'image_path' => 
                    $uploadedFile['secure_url'], 
 
                'thumbnail_path' => 
                    $thumbnailPath, 
            ]; 
        } 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Local storage fallback 
        |-------------------------------------------------------------------------- 
        */ 
 
        $imagePath = $image->store( 
            'products', 
            'public' 
        ); 
 
        return [ 
            'image_path' => 
                $imagePath, 
 
            'thumbnail_path' => 
                null, 
        ]; 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Create product variants 
    |-------------------------------------------------------------------------- 
    */ 
 
    private function syncVariants( 
        Product $product, 
        array $variants 
    ): void { 
        foreach ($variants as $variant) { 
            $product 
                ->variants() 
                ->create($variant); 
        } 
    } 
 
    /* 
    |-------------------------------------------------------------------------- 
    | Delete image file 
    |-------------------------------------------------------------------------- 
    */ 
 
    private function deleteImageFile( 
        ?string $path 
    ): void { 
        if ( 
            !$path || 
            preg_match( 
                '/^https?:\/\//i', 
                $path 
            ) 
        ) { 
            return; 
        } 
 
        Storage::disk('public')->delete( 
            $path 
        ); 
    } 
}