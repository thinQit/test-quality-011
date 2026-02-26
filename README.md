# test-quality-011

A simple CRUD dashboard app for managing Test Items with a responsive UI, health endpoint, and extensible architecture for authentication and RBAC.

## Features
- Responsive dashboard layout
- CRUD-ready API structure
- Health check endpoint
- Tailwind CSS styling and reusable UI components
- Auth and toast providers
- Jest + Playwright testing setup

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM (SQLite dev)
- Jest + Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
bash install.sh
# or on Windows
powershell -ExecutionPolicy Bypass -File install.ps1
```
Then run:
```bash
npm run dev
```

## Environment Variables
Create `.env` from `.env.example`:
- `DATABASE_URL` - Prisma database connection string
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - Base URL for API requests

## Project Structure
```
src/
  app/            # App Router layout, pages, and API routes
  components/     # UI and layout components
  lib/            # Utilities and API helpers
  providers/      # Auth and Toast providers
  types/          # Shared TypeScript types
prisma/           # Prisma schema and migrations
```

## API Endpoints (Planned)
- `GET /api/health`
- `GET /api/test-items`
- `GET /api/test-items/:id`
- `POST /api/test-items`
- `PUT /api/test-items/:id`
- `DELETE /api/test-items/:id`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Lint codebase
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit tests with Jest and Testing Library
- E2E tests with Playwright

## Notes
This scaffold includes foundational UI components, providers, and configuration for expanding the Test Items CRUD experience.
