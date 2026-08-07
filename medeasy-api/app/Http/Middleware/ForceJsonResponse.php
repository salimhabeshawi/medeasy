<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    // This API has no login page to redirect guests to, so unauthenticated
    // requests must always get a JSON 401, never an HTML redirect attempt.
    // Laravel decides which behavior to use based on $request->expectsJson(),
    // which depends on the client sending an Accept: application/json header
    // — something curl, Postman, and plenty of real HTTP clients don't do
    // by default. Forcing the header here makes that decision unconditional
    // for every request that hits this API, regardless of client behavior.
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}