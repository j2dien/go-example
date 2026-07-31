# Fullstack CRUD Application (Go + React + PostgreSQL)

A production-ready fullstack CRUD application featuring a Go (Gin + GORM) REST API backend and a React (Vite + TS + TanStack Query + Zod) frontend, fully containerized with Docker.

---

## 🏗 Project Architecture

```
d:\app\go\go-crud-api\
├── backend/                  # Go REST API (Clean Architecture)
│   ├── cmd/server/           # Entrypoint
│   ├── internal/             # Domain logic (config, database, model, dto, repo, service, handler, router, middleware)
│   ├── pkg/                  # Shared utilities (jwt, hash, response)
│   └── Dockerfile
├── frontend/                 # React SPA (Feature-driven structure)
│   ├── src/                  # API, components, features, pages, providers, stores, types
│   └── Dockerfile
├── docker-compose.yml        # PostgreSQL + Backend + Frontend Orchestration
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Database Setup
Start a PostgreSQL database locally or via Docker:
```bash
docker run -d --name go_crud_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=go_crud_db -p 5432:5432 postgres:16-alpine
```

### 2. Run Backend
```bash
cd backend
cp .env.example .env
go run ./cmd/server
```
The REST API will start at `http://localhost:8080/api/v1`.

### 3. Run Frontend
```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```
The React SPA will start at `http://localhost:5173`.

---

## 🚀 Production Deployment (Docker Compose)

To spin up the full production stack (PostgreSQL, Backend API, Nginx Static Frontend):

```bash
docker-compose up --build -d
```

- **Frontend SPA**: `http://localhost`
- **Backend API**: `http://localhost:8080/api/v1`
- **PostgreSQL**: `localhost:5432`

---

## 🔑 Authentication & Security

- **Authentication**: JWT Access Token (15-min expiry) & Refresh Token (7-day expiry).
- **Password Hashing**: Bcrypt (`golang.org/x/crypto/bcrypt`).
- **Authorization**: Role-based access control via Middleware.
