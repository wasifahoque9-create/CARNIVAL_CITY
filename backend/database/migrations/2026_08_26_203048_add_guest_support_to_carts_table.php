<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Guest carts will not have a logged-in user.
            $table->foreignId('user_id')
                ->nullable()
                ->change();

            // Identifies a guest browser/cart.
            $table->string('guest_token', 100)
                ->nullable()
                ->unique()
                ->after('user_id');
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