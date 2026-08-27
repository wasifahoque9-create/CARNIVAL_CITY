<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Admin listing — includes inactive/hidden banners, ordered for display in the dashboard.
     */
    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::orderBy('sort_order')->orderBy('id')->get();

        return BannerResource::collection($banners);
    }

    public function show(Banner $banner): BannerResource
    {
        return new BannerResource($banner);
    }

    public function store(Request $request): BannerResource
    {
        $data = $this->validateBanner($request);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create($data);

        return new BannerResource($banner);
    }

    public function update(Request $request, Banner $banner): BannerResource
    {
        $data = $this->validateBanner($request);

        if ($request->hasFile('image')) {
            // Replace the old file so storage/app/public/banners doesn't accumulate orphans.
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }

            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return new BannerResource($banner);
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }

    /**
     * Shared validation for store/update.
     *
     * Note: requests arrive as multipart/form-data (image upload), including on "update"
     * via Laravel's POST + _method=PUT spoofing — same pattern already used for products.
     */
    private function validateBanner(Request $request): array
    {
        $validated = $request->validate([
            'tag' => ['nullable', 'string', 'max:60'],
            'title' => ['required', 'string', 'max:150'],
            'highlight' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'discount_text' => ['nullable', 'string', 'max:60'],
            'cta_text' => ['nullable', 'string', 'max:40'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'secondary_cta_text' => ['nullable', 'string', 'max:40'],
            'secondary_cta_link' => ['nullable', 'string', 'max:255'],
            'fallback_emoji' => ['nullable', 'string', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        // image is handled separately (file storage), never mass-assigned directly.
        unset($validated['image']);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        return $validated;
    }
}
