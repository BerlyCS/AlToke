# AlToke

Gamified application to manage tasks with AI integration.

## Local Docker runtime

The local Docker stack runs with three services:

- `nginx`: serves the built Vite frontend and proxies API traffic
- `backend`: runs the Bun/Elysia API
- `postgres`: provides the database for the backend container

### Run

```bash
docker compose build
docker compose up -d
```

The frontend image defaults to the same-origin `/api` base path. If you need a different upstream, set `VITE_API_URL` when building the frontend image.

### Endpoints

- Frontend: `http://localhost:8080`
- Backend through nginx: `http://localhost:8080/api/`
- Backend direct access: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

`/api/*` is reverse-proxied to the backend without removing the `/api` prefix. The only special case is `/api/health` (and `/api/health/`), which nginx maps to the backend root health endpoint `/`.

### Stop

```bash
docker compose down
```

## Tests

- Cypress (frontend)
- Bun test (backend)
