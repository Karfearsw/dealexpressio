# DealExpress Server

## Setup

1. Copy `.env.example` to `.env` and configure your environment variables.
   - Ensure `DATABASE_URL` points to a valid PostgreSQL instance (local or Neon).
   - Set `SESSION_SECRET` to a secure string.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run migrations:
   ```bash
   npm run migration:push
   ```

4. (Optional) Seed the database with a test user:
   ```bash
   npx ts-node src/scripts/seed.ts
   ```
   This creates a user `test@example.com` with password `Password123!`.

## Development

Start the development server:
```bash
npm run dev
```

## Testing

Run unit tests:
```bash
npm test
```
