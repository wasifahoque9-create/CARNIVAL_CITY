<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Guard against pre-existing duplicate/blank google_id values before adding the constraint
        $duplicates = DB::table('users')
            ->select('google_id')
            ->whereNotNull('google_id')
            ->groupBy('google_id')
            ->havingRaw('count(*) > 1')
            ->get();

        if ($duplicates->isNotEmpty()) {
            throw new \RuntimeException('Duplicate google_id values exist — clean up before adding unique index.');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('google_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
        });
    }
};