<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $imageMap = [
            'soundwave-pro-anc' => 'products/WhatsApp Image 2026-06-29 at 1.16.56 AM.jpeg',
            'bassdrop-lite' => 'products/WhatsApp Image 2026-06-29 at 1.16.15 AM.jpeg',
            'sportfit-earbuds' => 'products/WhatsApp Image 2026-06-29 at 1.17.41 AM.jpeg',
            'studio-reference-buds' => 'products/WhatsApp Image 2026-06-29 at 1.16.56 AM.jpeg',
            'minibuds-compact' => 'products/WhatsApp Image 2026-06-29 at 1.16.15 AM.jpeg',
            'gaming-sync-earbuds' => 'products/WhatsApp Image 2026-06-29 at 1.17.41 AM.jpeg',
        ];

        foreach ($imageMap as $productSlug => $imagePath) {
            $product = DB::table('products')
                ->where('slug', $productSlug)
                ->first();

            if (! $product) {
                continue;
            }

            DB::table('product_images')
                ->where('product_id', $product->id)
                ->where('is_primary', true)
                ->update([
                    'image_path' => $imagePath,
                ]);
        }
    }

    public function down(): void
    {
        //
    }
};
