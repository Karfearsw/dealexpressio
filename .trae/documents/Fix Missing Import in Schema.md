I have confirmed that the `one` function is missing from the `drizzle-orm` imports in `server/src/db/schema.ts`, which is causing the build error.

## Plan
1.  **Fix the Import**: Update `server/src/db/schema.ts` to import `one` from `drizzle-orm`.
2.  **Commit and Push**: Commit the fix and push it to the repository to trigger a deployment.