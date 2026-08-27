<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // guest_token already exists from
            // 2026_08_26_203048_add_guest_support_to_carts_table.

            $table->foreignId('user_id')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable(false)
                ->change();
        });
    }
};