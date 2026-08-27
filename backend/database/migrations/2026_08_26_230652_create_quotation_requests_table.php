<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_requests', function (Blueprint $table) {
            $table->id();

            // Logged-in customer হলে user_id থাকবে,
            // guest হলে null থাকবে.
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Guest/customer contact information
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone');

            // Optional company information
            $table->string('company_name')->nullable();

            // Additional message / requirements
            $table->text('message')->nullable();

            // Cart total at the time of quotation request
            $table->decimal('estimated_total', 12, 2)
                ->default(0);

            // Admin quotation workflow
            $table->string('status')
                ->default('pending');

            // Admin can later store quoted amount
            $table->decimal('quoted_amount', 12, 2)
                ->nullable();

            // Admin note
            $table->text('admin_note')
                ->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('customer_email');
            $table->index('customer_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_requests');
    }
};