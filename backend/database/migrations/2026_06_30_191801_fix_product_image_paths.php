<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $imageMap = [
            // Laptops
            'novabook-pro-15' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'ultraslim-air-13' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'gameforge-x17' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'bizlite-14' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'creator-studio-16' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'travelmate-compact' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',

            // Desktop PCs
            'powerbuild-tower-i7' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'ryzen-beast-r9' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'office-essential-pc' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'streamstation-pro' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'compact-mini-pc' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'gaming-rig-alpha' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',

            // Tablets
            'imac-style-aio-24' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'surface-studio-clone' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'homehub-aio-23' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'procreator-aio-32' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'budget-aio-21' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'business-aio-elite' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',

            // Mobile Phones
            'galaxy-nova-s24' => 'products/mobile/galaxy-nova-s24.jpg.jfif',
            'iphone-horizon-15' => 'products/mobile/iphone-horizon-15.jpg.jpg',
            'pixel-wave-8' => 'products/mobile/pixel-wave-8.jpg.jpeg',
            'oneplus-turbo-12' => 'products/mobile/oneplus-turbo-12.jpg.jpeg',
            'budget-connect-m5' => 'products/mobile/budget-connect-m5.jpg.jfif',
            'rugged-field-x' => 'products/mobile/rugged-field-x.jpg.jpeg',

            // Earbuds
            'soundwave-pro-anc' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'bassdrop-lite' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'sportfit-earbuds' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'studio-reference-buds' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'minibuds-compact' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'gaming-sync-earbuds' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',

            // Accessories
            'fastcharge-usb-c-65w' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'slimshield-phone-case' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'mechtype-rgb-keyboard' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'precision-mouse-x2' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'braided-usb-c-cable-2m' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
            'powerbank-20000mah' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
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
