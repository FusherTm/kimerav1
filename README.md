# ERP Boilerplate

This project is a multi-tenant SaaS ERP boilerplate built with FastAPI, PostgreSQL, SQLAlchemy, Alembic on the backend and Next.js with TypeScript and Tailwind CSS on the frontend. It is packaged for local development using Docker Compose.

## Features
- JWT authentication and organization-based multi-tenancy via `X-Org-Slug` header
- 16 core ERP modules with SQLAlchemy models and CRUD APIs
- React/Next.js frontend with Tailwind CSS and simple login
- Docker Compose configuration for backend and Postgres

## Getting Started

1. Create an `.env` file in the `ops/` directory (see `ops/.env.example`):
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=erp
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/erp
# Set a strong key and restrict CORS in production
SECRET_KEY=change_this_in_production
ALLOW_ORIGINS=https://yourapp.example
```

2. Launch the stack:
```
cd ops
docker compose up --build
```

The API will be available at `http://localhost:8000` and the Next.js app at `http://localhost:3000` (if started separately with `npm run dev` inside `frontend`).

Security notes:
- In production, always set a strong `SECRET_KEY` and configure `ALLOW_ORIGINS` to your domain(s).
- Grant users only the permissions they need (e.g., `finance:view`, `finance:edit`, `order:view`, `partner:view`).
