<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            /*
             * Guest cart-এর user_id থাকবে না,
             * তাই user_id nullable হতে হবে.
             */
            $table->foreignId('user_id')
                ->nullable()
                ->change();

            /*
             * Guest customer-এর browser/cart identifier.
             */
            $table->string('guest_token', 100)
                ->nullable()
                ->unique();
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropUnique(['guest_token']);
            $table->dropColumn('guest_token');
        });
    }
};