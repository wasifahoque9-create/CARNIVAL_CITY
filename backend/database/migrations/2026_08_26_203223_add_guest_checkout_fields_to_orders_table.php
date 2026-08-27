<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Guest orders can exist without a registered user.
            $table->foreignId('user_id')
                ->nullable()
                ->change();

            $table->string('guest_name')->nullable();
            $table->string('guest_phone', 30)->nullable();
            $table->string('guest_email')->nullable();

            $table->string('guest_address_line1')->nullable();
            $table->string('guest_address_line2')->nullable();

            $table->string('guest_city')->nullable();
            $table->string('guest_area')->nullable();
            $table->string('guest_postal_code', 20)->nullable();

            $table->text('guest_notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'guest_name',
                'guest_phone',
                'guest_email',
                'guest_address_line1',
                'guest_address_line2',
                'guest_city',
                'guest_area',
                'guest_postal_code',
                'guest_notes',
            ]);
        });
    }
};