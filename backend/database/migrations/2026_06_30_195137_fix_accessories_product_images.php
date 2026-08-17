<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $imageMap = [
            'fastcharge-usb-c-65w' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'slimshield-phone-case' => 'products/WhatsApp Image 2026-06-29 at 12.55.31 AM.jpeg',
            'mechtype-rgb-keyboard' => 'products/WhatsApp Image 2026-06-29 at 1.19.01 AM.jpeg',
            'precision-mouse-x2' => 'products/WhatsApp Image 2026-06-29 at 1.19.55 AM.jpeg',
            'braided-usb-c-cable-2m' => 'products/WhatsApp Image 2026-06-29 at 1.21.44 AM.jpeg',
            'powerbank-20000mah' => 'products/WhatsApp Image 2026-06-29 at 1.22.53 AM.jpeg',
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
