<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Where the med student currently is. Null for admins and for
            // legacy students who signed up before these fields existed.
            $table->unsignedTinyInteger('year')->nullable();
            $table->unsignedTinyInteger('semester')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['year', 'semester']);
        });
    }
};