<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_request_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('quotation_request_id')
                ->constrained('quotation_requests')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            $table->foreignId('product_variant_id')
                ->nullable()
                ->constrained('product_variants')
                ->nullOnDelete();

            // Snapshot fields so quotation still makes sense
            // even if product name/price changes later.
            $table->string('product_name');

            $table->string('variant_name')
                ->nullable();

            $table->unsignedInteger('quantity')
                ->default(1);

            $table->decimal('unit_price', 12, 2)
                ->default(0);

            $table->decimal('line_total', 12, 2)
                ->default(0);

            $table->timestamps();

            $table->index('quotation_request_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_request_items');
    }
};