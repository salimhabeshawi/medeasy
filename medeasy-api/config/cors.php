<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],

    // Comma-separated list in FRONTEND_URL, e.g. for local dev + prod:
    // FRONTEND_URL=http://localhost:3000,https://medeasy.example.com
    'allowed_origins' => array_filter(explode(',', env('FRONTEND_URL', ''))),
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // false because we use bearer-token auth (Sanctum personal access
    // tokens), not cookies, so no credentialed CORS requests needed.
    'supports_credentials' => false,
];
