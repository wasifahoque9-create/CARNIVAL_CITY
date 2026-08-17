<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_images')) {
            return;
        }

        $basePath = storage_path('app/public/products');

        if (!is_dir($basePath)) {
            return;
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'jfif'];
        $files = [];

        foreach (new FilesystemIterator($basePath, FilesystemIterator::SKIP_DOTS) as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $extension = strtolower($file->getExtension());

            if (!in_array($extension, $allowedExtensions, true)) {
                continue;
            }

            $files[] = 'products/' . $file->getFilename();
        }

        sort($files, SORT_NATURAL | SORT_FLAG_CASE);

        if (count($files) === 0) {
            return;
        }

        $productImages = DB::table('product_images')
            ->orderBy('id')
            ->get(['id']);

        $i = 0;

        foreach ($productImages as $productImage) {
            DB::table('product_images')
                ->where('id', $productImage->id)
                ->update([
                    'image_path' => $files[$i % count($files)],
                ]);

            $i++;
        }
    }

    public function down(): void
    {
        //
    }
};