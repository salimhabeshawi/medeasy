# MedEasy API

Laravel API backend for a medical-student study platform: course content
library, curated YouTube videos, AI-powered summaries/Q&A/quizzes, and a
productivity time tracker with streaks.

## Status: Phase 1 — Auth + Courses + Content Library ✅ (built, untested)

This code was written outside of a full Laravel environment (no access to
Packagist in the sandbox it was built in), so **run through the checklist
below locally before trusting it** — it hasn't been executed yet.

## Requirements

- PHP 8.3+ (Laravel 13's minimum)
- Composer
- SQLite (for local dev) or PostgreSQL (matches production)

## Why Laravel 13, and what actually changed from the last draft

Laravel 13 (released March 17, 2026) shipped with **zero breaking changes**
from Laravel 12, which itself had almost none from Laravel 11. So this
wasn't really a rewrite — it's a version bump: `composer.json` now
requires PHP 8.3+ and `laravel/framework ^13.0`, and Sanctum is pinned to
`^4.3` (the first Sanctum release confirmed compatible with 13). None of
the actual application code (models, controllers, routes, migrations)
needed to change — the `bootstrap/app.php`-based structure introduced in
Laravel 11 is still exactly how 13 works.

One optional thing Laravel 13 adds: PHP 8 attributes as an alternative to
properties like `$fillable`/`$table` on models (e.g. `#[Table('courses')]`
instead of `protected $table = 'courses';`). We're intentionally *not*
using that here — it's new enough that documentation/tooling support is
still catching up, and the property-based style is more universally
understood for a portfolio piece others will read. Happy to switch if you
want the more cutting-edge look instead.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate

# SQLite is the local-dev default (DB_CONNECTION=sqlite in .env.example)
touch database/database.sqlite

php artisan migrate
php artisan db:seed

php artisan serve
```

This creates an admin account: `admin@medeasy.test` / `password`
(change this before deploying anywhere real).

## Verify it works

```bash
# Register a student
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"student@test.com","password":"password123","password_confirmation":"password123"}'

# Login as admin (seeded above)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medeasy.test","password":"password"}'
# -> copy the "token" from the response

# List courses (use the token from either login/register response)
curl http://localhost:8000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# View the seeded course with its full chapter/topic/content tree
curl http://localhost:8000/api/courses/human-anatomy \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

If all four of those return sensible JSON (not 500 errors), Phase 1 is solid.

## Architecture notes

- **Auth**: Sanctum personal access tokens (bearer token), not cookie/SPA
  auth — this API is decoupled from its frontend(s) by design, including
  future mobile.
- **Roles**: simple `role` enum column on `users` (`student`/`admin`).
  No separate roles table yet — intentionally simple since there's one
  admin today. Straightforward to extend into a proper roles/permissions
  system later without touching the API contract, since all checks go
  through `User::isAdmin()`.
- **Content hierarchy**: `Course → Chapter → Topic → ContentItem`.
  A `ContentItem` is a tagged union (`type`: text / markdown / pdf /
  video) — only the fields relevant to that type get populated.
- **File storage**: local disk in dev, Cloudflare R2 (S3-compatible) in
  production, because Heroku's filesystem is ephemeral.

## Not built yet

- Progress bar / dashboard analytics (Phase 2)
- AI summarizer, Q&A, and quiz generation via Gemini (Phase 3)
- Productivity time tracker + streaks (Phase 4)
- Deployment config for Heroku (Procfile, etc.) — coming once there's a
  first vertical slice worth deploying
