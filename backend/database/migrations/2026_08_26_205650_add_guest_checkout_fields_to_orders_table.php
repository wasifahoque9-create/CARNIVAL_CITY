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
            $table->foreignId('user_id')
                ->nullable()
                ->change();

            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();

            $table->string('guest_address_line1')->nullable();
            $table->string('guest_address_line2')->nullable();
            $table->string('guest_city')->nullable();
            $table->string('guest_postal_code')->nullable();
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
                'guest_name',
                'guest_email',
                'guest_phone',
                'guest_address_line1',
                'guest_address_line2',
                'guest_city',
                'guest_postal_code',
                'guest_country',
                'guest_token',
            ]);

            $table->foreignId('user_id')
                ->nullable(false)
                ->change();
        });
    }
};