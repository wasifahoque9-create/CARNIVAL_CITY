<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('personal_access_tokens', 'last_used_at')) {
                $table->timestamp('last_used_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            if (Schema::hasColumn('personal_access_tokens', 'last_used_at')) {
                $table->dropColumn('last_used_at');
            }
        });
    }
};