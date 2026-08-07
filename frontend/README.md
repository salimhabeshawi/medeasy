# MedEasy Frontend

React 18 + Vite + TypeScript frontend for the MedEasy Laravel Sanctum API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app reads `VITE_API_BASE_URL` from `.env`. The default is:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Scripts

```bash
npm run dev      # start Vite
npm run build    # type-check and produce dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## API Notes

The client uses the actual Laravel routes found in `../medeasy-api/routes/api.php`:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /courses`
- `GET /courses/:slug`
- `GET /topics/:id`

Progress and dashboard continuation endpoints are isolated in `src/lib/api.ts` because they are not present in the current route file yet.
