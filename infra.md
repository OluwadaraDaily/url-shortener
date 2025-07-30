# Running Docker

## Running these containers in detached mode

```bash

docker compose -f docker-compose.dev.yaml --env-file .env up --build -d
```

## Spinning down containers

```bash
docker compose -f docker-compose.dev.yaml down -v
```
