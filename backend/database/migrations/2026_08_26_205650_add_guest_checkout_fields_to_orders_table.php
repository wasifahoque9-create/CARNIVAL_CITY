<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // These columns already exist from the earlier
            // guest checkout migration.

            $table->string('guest_country')->nullable();

            $table->string('guest_token', 100)
                ->nullable()
                ->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['guest_token']);

            $table->dropColumn([
                'guest_country',
                'guest_token',
            ]);
        });
    }
};