<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Orders
        |--------------------------------------------------------------------------
        |
        | delivery_method:
        | - home_delivery
        | - pickup
        |
        | delivery_charge:
        | - Home Delivery হলে charge থাকবে
        | - Pickup হলে 0 থাকবে
        |
        */

        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_method', 30)
                ->default('home_delivery');

            $table->decimal('delivery_charge', 10, 2)
                ->default(0);
        });

        /*
        |--------------------------------------------------------------------------
        | Business Settings
        |--------------------------------------------------------------------------
        |
        | Admin এখান থেকে default Home Delivery charge set করবে.
        |
        */

        Schema::table('business_settings', function (Blueprint $table) {
            $table->decimal('delivery_charge', 10, 2)
                ->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_method',
                'delivery_charge',
            ]);
        });

        Schema::table('business_settings', function (Blueprint $table) {
            $table->dropColumn('delivery_charge');
        });
    }
};