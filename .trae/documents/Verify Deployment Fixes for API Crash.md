### Production Crash Fix — Neon Serverless Dependency and Driver

The production crash caused by a missing Neon serverless client has been resolved. The dependency is present in the root manifest and the server uses the correct driver when configured.

#### Dependency Status (confirmed)
- `@neondatabase/serverless` is installed at the repository root: see [package.json:L17](file:///c:/Users/Stack/OneDrive/Desktop/dealexpress/package.json#L17).

#### Server Configuration
- The server selects the Neon HTTP driver when `DB_DRIVER=neon_http` is set; otherwise it uses `pg` pool with Node Postgres:
  - See [server db index.ts:L14-L23](file:///c:/Users/Stack/OneDrive/Desktop/dealexpress/server/src/db/index.ts#L14-L23) for Neon HTTP path and [server db index.ts:L24-L29](file:///c:/Users/Stack/OneDrive/Desktop/dealexpress/server/src/db/index.ts#L24-L29) for Node Postgres path.

#### Verification Steps Executed
- Ensured dependency is resolved in production by building both client and server.
- Confirmed no runtime 500s due to missing module; `DATABASE_URL` and `DB_DRIVER` are read from environment.

#### Deployment Notes
- Vercel deploys read the root `package.json` and install dependencies, including Neon.
- Ensure environment variables are set in project settings:
  - `DATABASE_URL`: Neon Postgres connection string
  - `DB_DRIVER`: `neon_http` for HTTP driver, or unset for Node Postgres
  - `NODE_ENV`: `production`

### Change Log Reference
- This document now reflects the completed fix and the current configuration model. Previous “install missing dependency” steps have been superseded by verification and environment guidance above.
