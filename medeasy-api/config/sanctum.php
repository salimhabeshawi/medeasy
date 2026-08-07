<?php

use Laravel\Sanctum\Sanctum;

return [
    // Not used for our bearer-token flow, but Sanctum's service provider
    // reads this regardless, so it stays present with a safe default.
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000')),

    'guard' => ['web'],

    // Tokens expire after 30 days of issue; students re-login after that.
    // Set to null for tokens that never expire.
    'expiration' => 60 * 24 * 30,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
