<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            CategoryType::Laptop->value => [
                ['name' => 'NovaBook Pro 15', 'brand' => 'NovaTech', 'price' => 1299.99, 'discount_price' => 1199.99, 'specs' => ['processor' => 'Intel Core i7-13700H', 'ram' => '16GB DDR5', 'storage' => '512GB NVMe SSD', 'gpu' => 'RTX 4060', 'display_size' => '15.6"', 'os' => 'Windows 11']],
                ['name' => 'UltraSlim Air 13', 'brand' => 'SkyLine', 'price' => 999.00, 'specs' => ['processor' => 'Apple M3', 'ram' => '8GB', 'storage' => '256GB SSD', 'gpu' => 'Integrated', 'display_size' => '13.3"', 'os' => 'macOS']],
                ['name' => 'GameForge X17', 'brand' => 'GameForge', 'price' => 1899.00, 'discount_price' => 1749.00, 'specs' => ['processor' => 'AMD Ryzen 9 7940HS', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe SSD', 'gpu' => 'RTX 4070', 'display_size' => '17.3"', 'os' => 'Windows 11']],
                ['name' => 'BizLite 14', 'brand' => 'CorpEdge', 'price' => 849.00, 'specs' => ['processor' => 'Intel Core i5-1340P', 'ram' => '16GB DDR4', 'storage' => '512GB SSD', 'gpu' => 'Intel Iris Xe', 'display_size' => '14"', 'os' => 'Windows 11 Pro']],
                ['name' => 'Creator Studio 16', 'brand' => 'PixelCraft', 'price' => 1599.00, 'specs' => ['processor' => 'Intel Core i9-13900H', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe SSD', 'gpu' => 'RTX 4060', 'display_size' => '16"', 'os' => 'Windows 11']],
                ['name' => 'TravelMate Compact', 'brand' => 'RoadRunner', 'price' => 699.00, 'discount_price' => 649.00, 'specs' => ['processor' => 'Intel Core i3-1215U', 'ram' => '8GB DDR4', 'storage' => '256GB SSD', 'gpu' => 'Intel UHD', 'display_size' => '13.3"', 'os' => 'Windows 11']],
            ],
            CategoryType::Pc->value => [
                ['name' => 'PowerBuild Tower i7', 'brand' => 'BuildMaster', 'price' => 1199.00, 'specs' => ['processor' => 'Intel Core i7-13700F', 'ram' => '16GB DDR5', 'storage' => '1TB NVMe SSD', 'gpu' => 'RTX 4060 Ti', 'display_size' => 'N/A', 'os' => 'Windows 11']],
                ['name' => 'Ryzen Beast R9', 'brand' => 'AMD Elite', 'price' => 1499.00, 'discount_price' => 1399.00, 'specs' => ['processor' => 'AMD Ryzen 9 7900X', 'ram' => '32GB DDR5', 'storage' => '2TB NVMe SSD', 'gpu' => 'RTX 4070', 'display_size' => 'N/A', 'os' => 'Windows 11']],
                ['name' => 'Office Essential PC', 'brand' => 'CorpEdge', 'price' => 599.00, 'specs' => ['processor' => 'Intel Core i5-13400', 'ram' => '16GB DDR4', 'storage' => '512GB SSD', 'gpu' => 'Intel UHD 730', 'display_size' => 'N/A', 'os' => 'Windows 11 Pro']],
                ['name' => 'StreamStation Pro', 'brand' => 'LiveCast', 'price' => 1799.00, 'specs' => ['processor' => 'Intel Core i9-13900K', 'ram' => '64GB DDR5', 'storage' => '2TB NVMe SSD', 'gpu' => 'RTX 4080', 'display_size' => 'N/A', 'os' => 'Windows 11']],
                ['name' => 'Compact Mini PC', 'brand' => 'TinyTech', 'price' => 449.00, 'specs' => ['processor' => 'Intel Core i5-1240P', 'ram' => '16GB DDR4', 'storage' => '512GB SSD', 'gpu' => 'Intel Iris Xe', 'display_size' => 'N/A', 'os' => 'Windows 11']],
                ['name' => 'Gaming Rig Alpha', 'brand' => 'GameForge', 'price' => 2199.00, 'discount_price' => 1999.00, 'specs' => ['processor' => 'AMD Ryzen 7 7800X3D', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe SSD', 'gpu' => 'RTX 4080 Super', 'display_size' => 'N/A', 'os' => 'Windows 11']],
            ],
            CategoryType::Desktop->value => [
                ['name' => 'iMac Style AIO 24', 'brand' => 'VisionDesk', 'price' => 1299.00, 'specs' => ['processor' => 'Apple M3', 'ram' => '16GB', 'storage' => '512GB SSD', 'gpu' => 'Integrated', 'display_size' => '24"', 'os' => 'macOS']],
                ['name' => 'Surface Studio Clone', 'brand' => 'TouchPro', 'price' => 1599.00, 'discount_price' => 1499.00, 'specs' => ['processor' => 'Intel Core i7-13700H', 'ram' => '16GB DDR5', 'storage' => '1TB SSD', 'gpu' => 'RTX 4050', 'display_size' => '27"', 'os' => 'Windows 11']],
                ['name' => 'HomeHub AIO 23', 'brand' => 'FamilyTech', 'price' => 799.00, 'specs' => ['processor' => 'Intel Core i5-1335U', 'ram' => '8GB DDR4', 'storage' => '256GB SSD', 'gpu' => 'Intel Iris Xe', 'display_size' => '23.8"', 'os' => 'Windows 11']],
                ['name' => 'ProCreator AIO 32', 'brand' => 'PixelCraft', 'price' => 2199.00, 'specs' => ['processor' => 'AMD Ryzen 9 7940HS', 'ram' => '32GB DDR5', 'storage' => '1TB NVMe SSD', 'gpu' => 'RTX 4060', 'display_size' => '32"', 'os' => 'Windows 11']],
                ['name' => 'Budget AIO 21', 'brand' => 'ValuePoint', 'price' => 549.00, 'specs' => ['processor' => 'Intel Core i3-1215U', 'ram' => '8GB DDR4', 'storage' => '256GB SSD', 'gpu' => 'Intel UHD', 'display_size' => '21.5"', 'os' => 'Windows 11']],
                ['name' => 'Business AIO Elite', 'brand' => 'CorpEdge', 'price' => 1099.00, 'specs' => ['processor' => 'Intel Core i7-1360P', 'ram' => '16GB DDR5', 'storage' => '512GB SSD', 'gpu' => 'Intel Iris Xe', 'display_size' => '27"', 'os' => 'Windows 11 Pro']],
            ],
            CategoryType::Mobile->value => [
                ['name' => 'Galaxy Nova S24', 'brand' => 'Samsung', 'price' => 899.00, 'discount_price' => 849.00, 'specs' => ['processor' => 'Snapdragon 8 Gen 3', 'ram' => '8GB', 'storage' => '256GB', 'battery_mah' => 4000, 'display_size' => '6.2"', 'camera_mp' => 50]],
                ['name' => 'iPhone Horizon 15', 'brand' => 'Apple', 'price' => 999.00, 'specs' => ['processor' => 'A17 Pro', 'ram' => '8GB', 'storage' => '128GB', 'battery_mah' => 3349, 'display_size' => '6.1"', 'camera_mp' => 48]],
                ['name' => 'Pixel Wave 8', 'brand' => 'Google', 'price' => 699.00, 'specs' => ['processor' => 'Tensor G3', 'ram' => '8GB', 'storage' => '128GB', 'battery_mah' => 4575, 'display_size' => '6.2"', 'camera_mp' => 50]],
                ['name' => 'OnePlus Turbo 12', 'brand' => 'OnePlus', 'price' => 799.00, 'discount_price' => 749.00, 'specs' => ['processor' => 'Snapdragon 8 Gen 2', 'ram' => '12GB', 'storage' => '256GB', 'battery_mah' => 5400, 'display_size' => '6.7"', 'camera_mp' => 50]],
                ['name' => 'Budget Connect M5', 'brand' => 'ValuePoint', 'price' => 299.00, 'specs' => ['processor' => 'MediaTek Dimensity 7020', 'ram' => '6GB', 'storage' => '128GB', 'battery_mah' => 5000, 'display_size' => '6.5"', 'camera_mp' => 48]],
                ['name' => 'Rugged Field X', 'brand' => 'ArmorTech', 'price' => 549.00, 'specs' => ['processor' => 'Snapdragon 778G', 'ram' => '8GB', 'storage' => '128GB', 'battery_mah' => 6000, 'display_size' => '6.3"', 'camera_mp' => 64]],
            ],
            CategoryType::Earbuds->value => [
                ['name' => 'SoundWave Pro ANC', 'brand' => 'AudioMax', 'price' => 199.00, 'discount_price' => 179.00, 'specs' => ['battery_life' => '8h + 24h case', 'connectivity' => 'Bluetooth 5.3', 'noise_cancellation' => true]],
                ['name' => 'BassDrop Lite', 'brand' => 'BeatFlow', 'price' => 49.00, 'specs' => ['battery_life' => '6h + 18h case', 'connectivity' => 'Bluetooth 5.2', 'noise_cancellation' => false]],
                ['name' => 'SportFit Earbuds', 'brand' => 'ActiveAudio', 'price' => 79.00, 'specs' => ['battery_life' => '7h + 21h case', 'connectivity' => 'Bluetooth 5.3', 'noise_cancellation' => false]],
                ['name' => 'Studio Reference Buds', 'brand' => 'ProSound', 'price' => 149.00, 'specs' => ['battery_life' => '10h + 30h case', 'connectivity' => 'Bluetooth 5.3', 'noise_cancellation' => true]],
                ['name' => 'MiniBuds Compact', 'brand' => 'TinyTech', 'price' => 39.00, 'discount_price' => 29.00, 'specs' => ['battery_life' => '5h + 15h case', 'connectivity' => 'Bluetooth 5.1', 'noise_cancellation' => false]],
                ['name' => 'Gaming Sync Earbuds', 'brand' => 'GameForge', 'price' => 129.00, 'specs' => ['battery_life' => '8h + 24h case', 'connectivity' => 'Bluetooth 5.3', 'noise_cancellation' => true]],
            ],
            CategoryType::Accessory->value => [
                ['name' => 'FastCharge USB-C 65W', 'brand' => 'PowerUp', 'price' => 39.99, 'specs' => ['compatibility' => 'USB-C laptops & phones', 'type' => 'Charger']],
                ['name' => 'SlimShield Phone Case', 'brand' => 'GuardPro', 'price' => 24.99, 'specs' => ['compatibility' => 'Universal slim fit', 'type' => 'Case']],
                ['name' => 'MechType RGB Keyboard', 'brand' => 'KeyMaster', 'price' => 89.00, 'discount_price' => 79.00, 'specs' => ['compatibility' => 'Windows/Mac/Linux', 'type' => 'Keyboard']],
                ['name' => 'Precision Mouse X2', 'brand' => 'ClickPro', 'price' => 59.00, 'specs' => ['compatibility' => 'Bluetooth & USB receiver', 'type' => 'Mouse']],
                ['name' => 'Braided USB-C Cable 2m', 'brand' => 'LinkLine', 'price' => 14.99, 'specs' => ['compatibility' => 'USB-C devices', 'type' => 'Cable']],
                ['name' => 'PowerBank 20000mAh', 'brand' => 'ChargeGo', 'price' => 49.99, 'specs' => ['compatibility' => 'Phones & tablets', 'type' => 'Power bank']],
            ],
        ];

        foreach ($catalog as $type => $products) {
            $category = Category::query()->where('type', $type)->firstOrFail();

            foreach ($products as $index => $item) {
                $slug = Str::slug($item['name']);

                $product = Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'name' => $item['name'],
                        'brand' => $item['brand'],
                        'description' => 'Premium '.$item['name'].' from '.$item['brand'].'. Ideal for everyday gadget enthusiasts.',
                        'price' => $item['price'],
                        'discount_price' => $item['discount_price'] ?? null,
                        'stock_qty' => 50 + ($index * 5),
                        'status' => ProductStatus::Active,
                        'specifications' => $item['specs'],
                        'warranty_months' => 12,
                        'sku' => strtoupper(substr($type, 0, 3)).'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    ]
                );

                $product->categories()->syncWithoutDetaching([$category->id]);

                $product->images()->updateOrCreate(
    [
        'is_primary' => true,
    ],
    [
        'image_path' => 'products/'.$type.'/'.$slug.'.jpg',
    ],
);

                if ($product->variants()->count() === 0 && in_array($type, [CategoryType::Mobile->value, CategoryType::Laptop->value, CategoryType::Earbuds->value], true)) {
                    $product->variants()->createMany([
                        [
                            'variant_name' => 'Color',
                            'variant_value' => 'Black',
                            'price_adjustment' => 0,
                            'stock_qty' => 20,
                            'sku' => $product->sku.'-BLK',
                        ],
                        [
                            'variant_name' => 'Color',
                            'variant_value' => 'Silver',
                            'price_adjustment' => 10,
                            'stock_qty' => 15,
                            'sku' => $product->sku.'-SLV',
                        ],
                    ]);
                }
            }
        }
    }
}
