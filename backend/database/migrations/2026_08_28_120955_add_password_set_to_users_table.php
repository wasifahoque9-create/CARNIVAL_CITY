<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'password_set')) {
                $table->boolean('password_set')->default(true)->after('password');
            }
        });

        // Existing Google-only accounts never had a real password — flag them.
        DB::table('users')
            ->whereNotNull('google_id')
            ->update(['password_set' => false]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'password_set')) {
                $table->dropColumn('password_set');
            }
        });
    }
};