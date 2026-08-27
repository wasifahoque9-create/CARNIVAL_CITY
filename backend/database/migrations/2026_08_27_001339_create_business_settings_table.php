<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_settings', function (Blueprint $table) {
            $table->id();

            $table->string('business_name')
                ->default('ShopSphere');

            $table->string('business_email')
                ->nullable();

            $table->string('business_phone')
                ->nullable();

            $table->string('whatsapp_country_code', 10)
                ->default('880');

            $table->string('whatsapp_number', 30)
                ->nullable();

            $table->text('business_address')
                ->nullable();

            $table->string('currency', 10)
                ->default('BDT');

            $table->string('facebook_url')
                ->nullable();

            $table->string('instagram_url')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_settings');
    }
};