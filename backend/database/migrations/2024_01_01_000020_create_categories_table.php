<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            /*
             * NULL parent_id = main category.
             *
             * A non-NULL parent_id means this category
             * belongs to a main category.
             */
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('categories')
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('slug')
                ->unique();

            /*
             * Stores the category image path.
             *
             * Examples:
             * categories/laptops.jpg
             * https://res.cloudinary.com/...
             */
            $table->string('image_path')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};