<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Laptops', 'slug' => 'laptops', 'type' => CategoryType::Laptop],
            ['name' => 'Desktop PCs', 'slug' => 'desktop-pcs', 'type' => CategoryType::Pc],
            ['name' => 'All-in-One Desktops', 'slug' => 'all-in-one-desktops', 'type' => CategoryType::Desktop],
            ['name' => 'Mobile Phones', 'slug' => 'mobile-phones', 'type' => CategoryType::Mobile],
            ['name' => 'Earbuds', 'slug' => 'earbuds', 'type' => CategoryType::Earbuds],
            ['name' => 'Accessories', 'slug' => 'accessories', 'type' => CategoryType::Accessory],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
