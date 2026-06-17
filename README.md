# AlToke

Gamified application to manage tasks with AI integration.

## Local Docker runtime

The Docker stack runs with exactly two runtime containers:

- `nginx`: serves the built Vite frontend and proxies `/api/*`
- `backend`: runs the Bun/Elysia API

### Run

```bash
docker compose build
docker compose up -d
```

### Endpoints

- Frontend: `http://localhost:8080`
- Backend through nginx: `http://localhost:8080/api/`
- Backend direct access: `http://localhost:3000`

`/api/*` is reverse-proxied to the backend with the `/api` prefix removed, so `/api/users` becomes `/users` upstream.

### Stop

```bash
docker compose down
```

## Tests

- Cypress (frontend)
- Bun test (backend)
