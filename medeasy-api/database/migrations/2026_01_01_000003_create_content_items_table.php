<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();

            // 'text'     -> body holds HTML/rich text written in-system
            // 'markdown' -> body holds raw markdown
            // 'pdf'      -> file_path/file_disk hold an uploaded file (R2)
            // 'video'    -> youtube_url holds a curated video link
            $table->enum('type', ['text', 'markdown', 'pdf', 'video']);

            $table->string('title');
            $table->longText('body')->nullable();

            $table->string('file_path')->nullable();
            $table->string('file_disk')->nullable();
            $table->string('file_mime')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();

            $table->string('youtube_url')->nullable();
            $table->string('youtube_video_id', 32)->nullable();

            $table->unsignedInteger('order_index')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_items');
    }
};
