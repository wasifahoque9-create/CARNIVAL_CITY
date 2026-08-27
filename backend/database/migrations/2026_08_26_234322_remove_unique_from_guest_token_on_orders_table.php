<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            /*
             * A guest must be able to place multiple orders
             * from the same browser/cart token.
             *
             * Therefore guest_token must NOT be unique.
             */
            $table->dropUnique(['guest_token']);
        });

        Schema::table('orders', function (Blueprint $table) {
            /*
             * Keep a normal index for faster lookup.
             */
            $table->index('guest_token');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['guest_token']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unique('guest_token');
        });
    }
};