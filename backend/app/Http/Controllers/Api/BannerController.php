<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Public endpoint consumed by the homepage hero slider.
     * Only active banners are returned, in admin-defined order.
     */
    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return BannerResource::collection($banners);
    }

    /**
     * Admin: list all banners.
     */
    public function adminIndex(): AnonymousResourceCollection
    {
        $banners = Banner::orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return BannerResource::collection($banners);
    }

    /**
     * Admin: create a banner.
     */
    public function store(Request $request): BannerResource
    {
        $validated = $request->validate([
            'tag' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'highlight' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'discount_text' => ['nullable', 'string', 'max:255'],
            'cta_text' => ['nullable', 'string', 'max:255'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'secondary_cta_text' => ['nullable', 'string', 'max:255'],
            'secondary_cta_link' => ['nullable', 'string', 'max:255'],
            'fallback_emoji' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')
                ->store('banners', 'public');
        }

        unset($validated['image']);

        $banner = Banner::create($validated);

        return new BannerResource($banner);
    }

    /**
     * Admin: update a banner.
     */
    public function update(Request $request, Banner $banner): BannerResource
    {
        $validated = $request->validate([
            'tag' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'highlight' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'discount_text' => ['nullable', 'string', 'max:255'],
            'cta_text' => ['nullable', 'string', 'max:255'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'secondary_cta_text' => ['nullable', 'string', 'max:255'],
            'secondary_cta_link' => ['nullable', 'string', 'max:255'],
            'fallback_emoji' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }

            $validated['image_path'] = $request->file('image')
                ->store('banners', 'public');
        }

        unset($validated['image']);

        $banner->update($validated);

        return new BannerResource($banner->fresh());
    }

    /**
     * Admin: delete a banner.
     */
    public function destroy(Banner $banner): JsonResponse
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return response()->json([
            'message' => 'Banner deleted successfully.',
        ]);
    }
}