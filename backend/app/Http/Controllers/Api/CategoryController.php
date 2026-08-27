<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Category\StoreCategoryRequest;
use App\Http\Requests\Api\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
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
         * Remove the uploaded file from the data array
         * because image is not a database column.
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
         * image is the uploaded file, not a database
         * field, so remove it before updating the model.
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
        if (
            $category->primaryProducts()->exists() ||
            $category->products()->exists()
        ) {
            return response()->json([
                'message' =>
                    'Cannot delete category with associated products.',
            ], 422);
        }

        /*
         * Delete the category image from storage
         * before deleting the category.
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

        $category->delete();

        return response()->json([
            'message' =>
                'Category deleted successfully.',
        ]);
    }
}