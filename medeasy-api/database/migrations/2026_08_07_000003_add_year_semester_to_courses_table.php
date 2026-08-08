<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Med school content is organized by academic year (1-7) and
            // semester. 14 semesters total = 2 per year. Default to year 1
            // semester 1 so pre-existing rows stay valid.
            $table->unsignedTinyInteger('year')->default(1);
            $table->unsignedTinyInteger('semester')->default(1);
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['year', 'semester']);
        });
    }
};