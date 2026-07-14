#!/usr/bin/env bash
set -euo pipefail

deploy_path="$DEPLOY_PATH"
compose_candidates=(docker-compose.yml docker-compose.yaml compose.yml compose.yaml)
compose_file=""

if [[ ! -d "$deploy_path" ]]; then
  echo "Remote deploy path validation failed: the directory configured by the deploy-path secret does not exist on host $(hostname)." >&2
  echo "Verify the branch-to-environment mapping and confirm the secret value points to an existing directory on the server." >&2
  exit 1
fi

cd "$deploy_path"
for candidate in "${compose_candidates[@]}"; do
  if [[ -f "$candidate" ]]; then
    compose_file="$candidate"
    break
  fi
done

if [[ -z "$compose_file" ]]; then
  echo "Remote deploy path validation failed: no Docker Compose file was found in the deploy directory." >&2
  echo "Expected one of: ${compose_candidates[*]}" >&2
  exit 1
fi

echo "Validated remote deploy directory and compose file: $compose_file"
docker compose -f "$compose_file" down -v
docker compose -f "$compose_file" pull
docker compose -f "$compose_file" up -d
docker compose -f "$compose_file" ps

backend_container_id="$(docker compose -f "$compose_file" ps -q backend)"
if [[ -z "$backend_container_id" ]]; then
  echo "Deployment verification failed: backend service container was not created." >&2
  docker compose -f "$compose_file" ps >&2 || true
  exit 1
fi

deadline=$((SECONDS + 120))
while true; do
  health_status="$(docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" "$backend_container_id")"

  if [[ "$health_status" == "healthy" ]]; then
    echo "Backend deployment verification succeeded: container is healthy."
    break
  fi

  if [[ "$health_status" == "unhealthy" || "$health_status" == "exited" || "$health_status" == "dead" ]]; then
    echo "Deployment verification failed: backend container entered status '$health_status'." >&2
    docker compose -f "$compose_file" ps >&2 || true
    docker compose -f "$compose_file" logs --no-color backend >&2 || true
    exit 1
  fi

  if (( SECONDS >= deadline )); then
    echo "Deployment verification failed: backend container did not become healthy within 120 seconds (last status: '$health_status')." >&2
    docker compose -f "$compose_file" ps >&2 || true
    docker compose -f "$compose_file" logs --no-color backend >&2 || true
    exit 1
  fi

  sleep 5
done
