<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_person_name')
                ->nullable()
                ->after('delivery_charge');

            $table->string('delivery_person_phone')
                ->nullable()
                ->after('delivery_person_name');

            $table->string('tracking_number')
                ->nullable()
                ->after('delivery_person_phone');

            $table->string('delivery_status')
                ->nullable()
                ->after('tracking_number');

            $table->text('delivery_note')
                ->nullable()
                ->after('delivery_status');

            $table->timestamp('delivery_updated_at')
                ->nullable()
                ->after('delivery_note');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_person_name',
                'delivery_person_phone',
                'tracking_number',
                'delivery_status',
                'delivery_note',
                'delivery_updated_at',
            ]);
        });
    }
};