# Docker Compose Setup

To run PostgreSQL using Docker:

```bash
docker run -d \
  --name postgres-clean-nest \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=template_clean_nest \
  -p 5433:5433 \
  postgres:15-alpine
```

Or create a docker-compose.yml file:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres-clean-nest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: template_clean_nest
    ports:
      - '5433:5433'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```
