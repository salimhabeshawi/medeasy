<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\ContentItemController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\TopicProgressController;
use Illuminate\Support\Facades\Route;

// --- Public (no auth) ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// --- Authenticated (any logged-in student or admin) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);

    // Read access to the content library
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course:slug}', [CourseController::class, 'show']);
    Route::get('/chapters/{chapter}', [ChapterController::class, 'show']);
    Route::get('/topics/{topic}', [TopicController::class, 'show']);
    Route::get('/topics/{topic}/outline', [TopicController::class, 'outline']);
    Route::get('/content-items/{contentItem}', [ContentItemController::class, 'show']);

    // Per-user progress (marking a topic complete/incomplete)
    Route::post('/topics/{topic}/complete', [TopicProgressController::class, 'complete']);
    Route::post('/topics/{topic}/incomplete', [TopicProgressController::class, 'incomplete']);

    // Dashboard: most recently viewed topic, with its chapter and course.
    Route::get('/dashboard/continue', [DashboardController::class, 'continue']);

    // --- Admin only: managing the content library ---
    Route::middleware('admin')->group(function () {
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        Route::post('/chapters', [ChapterController::class, 'store']);
        Route::put('/chapters/{chapter}', [ChapterController::class, 'update']);
        Route::delete('/chapters/{chapter}', [ChapterController::class, 'destroy']);

        Route::post('/topics', [TopicController::class, 'store']);
        Route::put('/topics/{topic}', [TopicController::class, 'update']);
        Route::delete('/topics/{topic}', [TopicController::class, 'destroy']);

        Route::post('/content-items', [ContentItemController::class, 'store']);
        // POST, not PUT: this endpoint accepts multipart/form-data file
        // uploads, and PHP doesn't parse multipart bodies on PUT requests.
        // Frontend should send a `_method=PUT` field to keep semantics
        // clear if desired (Laravel's MethodField spoofing handles this).
        Route::post('/content-items/{contentItem}', [ContentItemController::class, 'update']);
        Route::delete('/content-items/{contentItem}', [ContentItemController::class, 'destroy']);
    });
});
