<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Every request hitting the API should be treated as JSON, since
        // this app has no HTML login page for guests to be redirected to.
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);

        // Belt-and-suspenders: even with ForceJsonResponse in place, make
        // it explicit that guests are never redirected anywhere. Without
        // this, Laravel's default fallback tries to resolve a route named
        // 'login', which doesn't exist in an API-only app and throws
        // RouteNotFoundException instead of a clean 401.
        $middleware->redirectGuestsTo(fn () => null);

        // Register a route middleware alias so we can write
        // ->middleware('admin') on routes that only admins may hit.
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);

        // CORS is handled by Laravel's built-in HandleCors middleware,
        // configured via config/cors.php. It's enabled by default in the
        // 'api' middleware group, so no extra wiring needed.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return clean JSON for API exceptions instead of Laravel's
        // default HTML error pages, since this app is API-only.
        $exceptions->shouldRenderJsonWhen(function ($request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();