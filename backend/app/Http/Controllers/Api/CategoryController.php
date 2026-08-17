<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Category\StoreCategoryRequest;
use App\Http\Requests\Api\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
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
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $category = Category::create($data);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category->fresh('children')),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->primaryProducts()->exists() || $category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with associated products.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
