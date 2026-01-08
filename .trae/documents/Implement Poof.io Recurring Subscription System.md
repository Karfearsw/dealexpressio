## **Phase 1: Database & Configuration**
1. **Update Database Schema**:
   - Add `subscriptions` table to [schema.ts](file:///c%3A/Users/Stack/OneDrive/Desktop/dealexpress/server/src/db/schema.ts).
   - Add `payments` table to [schema.ts](file:///c%3A/Users/Stack/OneDrive/Desktop/dealexpress/server/src/db/schema.ts).
   - Update `usersRelations` and add new relations for the new tables.
2. **Create Plan Config**:
   - Create `server/src/config/plans.ts` to store plan IDs, pricing, and feature limits.

## **Phase 2: Service Layer**
1. **Poof API Client**:
   - Create `server/src/services/poof.ts` to encapsulate Poof.io API logic using `axios`.
2. **Subscription Management Service**:
   - Create `server/src/services/subscription.ts` to manage subscription lifecycle (creation, activation, renewal, cancellation).

## **Phase 3: API Refactoring**
1. **Update Payments Routes**:
   - Refactor [payments.ts](file:///c%3A/Users/Stack/OneDrive/Desktop/dealexpress/server/src/routes/payments.ts) to use the new services.
   - Implement the Poof webhook handler with status verification and database updates.
2. **Frontend Integration**:
   - Ensure the pricing page and checkout buttons correctly target the new endpoints.

## **Phase 4: Environment & Verification**
1. **Env Var Checklist**:
   - Provide the final list of `.env` variables required for the production deployment.
2. **Migration**:
   - Generate and push the new Drizzle migration to the Neon database.
