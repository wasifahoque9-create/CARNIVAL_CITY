<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Category\StoreCategoryRequest;
use App\Http\Requests\Api\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        /*
         * Generate slug automatically if the admin
         * does not provide one.
         */
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        /*
         * Upload category image.
         *
         * The actual file will be stored in:
         * storage/app/public/categories/
         *
         * The database will store something like:
         * categories/laptop.jpg
         */
        if ($request->hasFile('image')) {
            $data['image_path'] = $request
                ->file('image')
                ->store('categories', 'public');
        }

        /*
         * image is an uploaded file, not a database column.
         */
        unset($data['image']);

        $category = Category::create($data);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category
    ): JsonResponse {
        $data = $request->validated();

        /*
         * Automatically regenerate the slug if the
         * category name is changed and no slug was supplied.
         */
        if (
            isset($data['name']) &&
            !isset($data['slug'])
        ) {
            $data['slug'] = Str::slug($data['name']);
        }

        /*
         * If a new image was uploaded:
         *
         * 1. Delete the old image.
         * 2. Store the new image.
         * 3. Save the new path.
         */
        if ($request->hasFile('image')) {
            if (
                $category->image_path &&
                Storage::disk('public')->exists($category->image_path)
            ) {
                Storage::disk('public')->delete(
                    $category->image_path
                );
            }

            $data['image_path'] = $request
                ->file('image')
                ->store('categories', 'public');
        }

        /*
         * image is the uploaded file, not a database field.
         */
        unset($data['image']);

        $category->update($data);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource(
                $category->fresh('children')
            ),
        ]);
    }

    public function destroy(
        Category $category
    ): JsonResponse {
        /*
         * Delete the category safely without deleting
         * any products.
         *
         * Products can be connected to categories in
         * two different ways in this project:
         *
         * 1. products.category_id
         * 2. category_product pivot table
         *
         * We remove both associations first.
         */

        DB::transaction(function () use ($category) {

            /*
             * Remove the category from the many-to-many
             * category_product relationship.
             *
             * IMPORTANT:
             * This does NOT delete the products.
             */
            $category->products()->detach();

            /*
             * Remove the category from products that use
             * this category as their primary category.
             *
             * This requires products.category_id to allow NULL.
             */
            $category->primaryProducts()->update([
                'category_id' => null,
            ]);

            /*
             * If this category has child categories,
             * don't delete those child categories.
             *
             * Instead, make them top-level categories.
             */
            $category->children()->update([
                'parent_id' => null,
            ]);

            /*
             * Delete the category image from storage.
             */
            if (
                $category->image_path &&
                Storage::disk('public')->exists(
                    $category->image_path
                )
            ) {
                Storage::disk('public')->delete(
                    $category->image_path
                );
            }

            /*
             * Finally delete only the category itself.
             *
             * Products remain untouched.
             */
            $category->delete();
        });

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}