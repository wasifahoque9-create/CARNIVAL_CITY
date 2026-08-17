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
            'ultraslim-air-13' => 'products/WhatsApp Image 2026-06-29 at 1.02.23 AM.jpeg',
            'gameforge-x17' => 'products/WhatsApp Image 2026-06-29 at 1.04.54 AM.jpeg',
            'bizlite-14' => 'products/WhatsApp Image 2026-06-29 at 1.07.17 AM.jpeg',
            'creator-studio-16' => 'products/WhatsApp Image 2026-06-29 at 1.07.32 AM.jpeg',
            'travelmate-compact' => 'products/WhatsApp Image 2026-06-29 at 1.07.44 AM.jpeg',

            // Desktop PCs
            'powerbuild-tower-i7' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'ryzen-beast-r9' => 'products/21Jrje4gXt8Li434RFAFrAI23d8HK8l61PJDHQKE.jpg',
            'office-essential-pc' => 'products/6XtwW4VLopfIi2v9r1CZsjl6OOJObRi4G9O4Wr25.jpg',
            'streamstation-pro' => 'products/75KMOBW4y04igaLJPVyZlwfV2YGRFH1Bi3ykAhet.jpg',
            'compact-mini-pc' => 'products/8PLXQ7yrkoSLoATMlTmhgL2wf2uWuvORDMSPl0dD.jpg',
            'gaming-rig-alpha' => 'products/AMKerHvMnE6nvoyUClWFU5Huoch2FBglXtUxiZlZ.jpg',

            // Tablets / AIO
            'imac-style-aio-24' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'surface-studio-clone' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'homehub-aio-23' => 'products/e4oLtDWufAq6Q3JYKkIbjtkzjZgvli563AvXNB7W.jpg',
            'procreator-aio-32' => 'products/FNWxOvZgRFFLrF3oA4YIaCKDAWUFL7y5pzcOABWU.jpg',
            'budget-aio-21' => 'products/HXd0Ypnzkfodgp7uqgXNA4R51d28drAXcBnH6Oxi.jpg',
            'business-aio-elite' => 'products/kOtFCvb4RCqBoL8b5jN7qbJqv1ooVOstLBRUjrw0.jpg',

            // Mobile Phones
            'galaxy-nova-s24' => 'products/mobile/galaxy-nova-s24.jpg.jfif',
            'iphone-horizon-15' => 'products/mobile/iphone-horizon-15.jpg.jpg',
            'pixel-wave-8' => 'products/mobile/pixel-wave-8.jpg.jpeg',
            'oneplus-turbo-12' => 'products/mobile/oneplus-turbo-12.jpg.jpeg',
            'budget-connect-m5' => 'products/mobile/budget-connect-m5.jpg.jfif',
            'rugged-field-x' => 'products/mobile/rugged-field-x.jpg.jpeg',

            // Earbuds
            'soundwave-pro-anc' => 'products/WhatsApp Image 2026-06-29 at 1.09.18 AM.jpeg',
            'bassdrop-lite' => 'products/WhatsApp Image 2026-06-29 at 1.09.55 AM.jpeg',
            'sportfit-earbuds' => 'products/WhatsApp Image 2026-06-29 at 1.10.58 AM.jpeg',
            'studio-reference-buds' => 'products/WhatsApp Image 2026-06-29 at 1.16.15 AM.jpeg',
            'minibuds-compact' => 'products/WhatsApp Image 2026-06-29 at 1.16.56 AM.jpeg',
            'gaming-sync-earbuds' => 'products/WhatsApp Image 2026-06-29 at 1.17.41 AM.jpeg',

            // Accessories
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
