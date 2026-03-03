# Test Quality Dashboard

A minimal CRUD dashboard app for creating, viewing, editing, and deleting Test records. Includes a dashboard list, detail pages, and health endpoint for service monitoring.

## Features
- CRUD API for Tests
- Dashboard, create, detail, and import pages
- CSV import/export endpoints
- Health endpoint with optional DB check
- Tailwind-based UI scaffold
- Prisma ORM with SQLite

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM (SQLite)
- Tailwind CSS
- Jest + Playwright (configured)

## Prerequisites
- Node.js 18+
- npm

## Quick Start

```bash
./install.sh
# or on Windows
./install.ps1
```

Then:

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` - SQLite DB URL (default: `file:./dev.db`)
- `JWT_SECRET` - Secret for JWT signing
- `NEXT_PUBLIC_API_URL` - Base API URL for client fetches

## Project Structure

```
src/
  app/            Next.js routes and API handlers
  components/     Reusable UI components
  providers/      Auth and toast providers
  lib/            Utilities, auth, prisma client
  types/          Shared TypeScript types
prisma/           Prisma schema and migrations
```

## API Endpoints

- `GET /api/health` - Health status
- `GET /api/tests` - List tests (page, pageSize, q, status)
- `POST /api/tests` - Create test (auth required)
- `GET /api/tests/:id` - Get test
- `PUT /api/tests/:id` - Update test (auth required)
- `DELETE /api/tests/:id` - Delete test (auth required)
- `POST /api/tests/import` - CSV import (auth required)
- `GET /api/tests/export` - CSV export

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest
- `npm run test:e2e` - Run Playwright tests

## Testing

```bash
npm run test
npm run test:e2e
```

## Notes
- Read endpoints are public by default; write endpoints require JWT auth.
- Update Prisma schema and run `npx prisma db push` after changes.
