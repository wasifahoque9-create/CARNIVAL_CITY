<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * No image rename needed.
         * This uses existing files inside storage/app/public/products.
         */

        $imageMap = [
            /*
            |--------------------------------------------------------------------------
            | Accessories
            |--------------------------------------------------------------------------
            */
            'fastcharge-usb-c-65w' => 'products/6XtwW4VLopfIi2v9r1CZsjl6OOJObRi4G9O4Wr25.jpg',
            'slimshield-phone-case' => 'products/dROhNf3iT5NYAlYOtpEczcA3FwhdhWDZqFqt0IGl.jpg',
            'mechtype-rgb-keyboard' => 'products/75KMOBW4y04igaLJPVyZlwfV2YGRFH1Bi3ykAhet.jpg',
            'precision-mouse-x2' => 'products/e4oLtDWufAq6Q3JYKkIbjtkzjZgvli563AvXNB7W.jpg',
            'braided-usb-c-cable-2m' => 'products/LOh1mcJ7smTbNNE7qR7io0E2rM1JKTCOynG3ecTO.jpg',
            'powerbank-20000mah' => 'products/kPUPCtI43MvrJvodmL2PF9siDIBnNqdgpiMbqIvH.jpg',

            /*
            |--------------------------------------------------------------------------
            | Laptops
            |--------------------------------------------------------------------------
            */
            'novabook-pro-15' => 'products/21Jrje4gXt8Li434RFAFrAI23d8HK8l61PJDHQKE.jpg',
            'ultraslim-air-13' => 'products/WhatsApp Image 2026-06-29 at 1.02.23 AM.jpeg',
            'gameforge-x17' => 'products/8PLXQ7yrkoSLoATMlTmhgL2wf2uWuvORDMSPl0dD.jpg',
            'bizlite-14' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',
            'creator-studio-16' => 'products/WhatsApp Image 2026-06-29 at 1.04.54 AM.jpeg',
            'travelmate-compact' => 'products/WhatsApp Image 2026-06-29 at 12.36.59 AM.jpeg',

            /*
            |--------------------------------------------------------------------------
            | Desktop PCs
            |--------------------------------------------------------------------------
            */
            'powerbuild-tower-i7' => 'products/FNWxOvZgRFFLrF3oA4YIaCKDAWUFL7y5pzcOABWU.jpg',
            'ryzen-beast-r9' => 'products/kOtFCvb4RCqBoL8b5jN7qbJqv1ooVOstLBRUjrw0.jpg',
            'office-essential-pc' => 'products/e6ZiWfssjDBdCWuYUqDSeivPZjmjoLQzSHhKRYZP.jpg',
            'streamstation-pro' => 'products/HXd0Ypnzkfodgp7uqgXNA4R51d28drAXcBnH6Oxi.jpg',
            'compact-mini-pc' => 'products/wH7cSv4zUGALiomdFcSWWDdiqWVzRfOBYDj29pxf.jpg',
            'gaming-rig-alpha' => 'products/8PLXQ7yrkoSLoATMlTmhgL2wf2uWuvORDMSPl0dD.jpg',

            /*
            |--------------------------------------------------------------------------
            | Tablets / AIO
            |--------------------------------------------------------------------------
            */
            'imac-style-aio-24' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',
            'surface-studio-clone' => 'products/WhatsApp Image 2026-06-29 at 1.02.23 AM.jpeg',
            'homehub-aio-23' => 'products/WhatsApp Image 2026-06-29 at 1.07.17 AM.jpeg',
            'procreator-aio-32' => 'products/FNWxOvZgRFFLrF3oA4YIaCKDAWUFL7y5pzcOABWU.jpg',
            'budget-aio-21' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',
            'business-aio-elite' => 'products/e6ZiWfssjDBdCWuYUqDSeivPZjmjoLQzSHhKRYZP.jpg',

            /*
            |--------------------------------------------------------------------------
            | Mobile Phones
            |--------------------------------------------------------------------------
            */
            'galaxy-nova-s24' => 'products/mobile/galaxy-nova-s24.jpg.jfif',
            'iphone-horizon-15' => 'products/mobile/iphone-horizon-15.jpg.jpg',
            'pixel-wave-8' => 'products/mobile/pixel-wave-8.jpg.jpeg',
            'oneplus-turbo-12' => 'products/mobile/oneplus-turbo-12.jpg.jpeg',
            'budget-connect-m5' => 'products/mobile/budget-connect-m5.jpg.jfif',
            'rugged-field-x' => 'products/mobile/rugged-field-x.jpg.jpeg',

            /*
            |--------------------------------------------------------------------------
            | Earbuds
            |--------------------------------------------------------------------------
            */
            'soundwave-pro-anc' => 'products/iuBaeDutEFRv0YPOPYQA5qOo0CL6hv7KMMYbo4Wi.jpg',
            'bassdrop-lite' => 'products/c2LkhWAtXXri3kD0rhU6w4rJLs4AFKbrC2SZki4u.jpg',
            'sportfit-earbuds' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',
            'studio-reference-buds' => 'products/kPUPCtI43MvrJvodmL2PF9siDIBnNqdgpiMbqIvH.jpg',
            'minibuds-compact' => 'products/6XtwW4VLopfIi2v9r1CZsjl6OOJObRi4G9O4Wr25.jpg',
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
