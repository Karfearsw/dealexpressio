# DealExpress CRM

A real estate wholesaling CRM platform built with React and Express.

## Overview

DealExpress is a full-stack web application for managing leads, deals, properties, and buyers in real estate wholesaling. It provides tools for deal calculation, lead management, communication tracking, and analytics.

## Project Architecture

### Frontend (client/)
- **Framework**: React 19 with TypeScript
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: Wouter
- **UI Components**: Radix UI primitives
- **State Management**: React Context API

### Backend (server/)
- **Framework**: Express 4 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with connect-pg-simple
- **Payments**: Stripe integration

### Database
- PostgreSQL database with Drizzle ORM
- Migrations located in `server/drizzle/`
- Schema defined in `server/src/db/schema.ts`

## Running the Application

The application runs both frontend and backend concurrently using:
```bash
npm run dev
```

- Frontend runs on port 5000 (0.0.0.0)
- Backend API runs on port 3000 (localhost)
- Frontend proxies `/api` requests to the backend

## Development Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client:dev` - Start only the frontend
- `npm run server:dev` - Start only the backend
- `npm run build` - Build both frontend and backend
- `cd server && npm run migrate` - Run database migrations
- `cd server && npm run migration:push` - Push schema changes to database

## Key Directories

```
client/
├── src/
│   ├── components/  # React components
│   ├── context/     # React context providers
│   ├── pages/       # Page components
│   ├── lib/         # Utility functions
│   └── types/       # TypeScript types
server/
├── src/
│   ├── routes/      # API route handlers
│   ├── db/          # Database configuration and schema
│   ├── middleware/  # Express middleware
│   ├── services/    # Business logic services
│   └── config/      # Configuration files
└── drizzle/         # Database migrations
```

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `STRIPE_SECRET_KEY` - Stripe API key (for payments)
- `SIGNALWIRE_*` - SignalWire credentials (for communication features)
