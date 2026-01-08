I have analyzed the codebase and identified the specific causes for the signup issues and the missing payment integration. Here is the plan to resolve them and implement the requested features.

### Phase 1: Fix Data Loss in Registration
The primary reason signup feels "broken" is that user data is being discarded.
1.  **Update Database Schema**: Modify `server/src/db/schema.ts` to add `firstName` and `lastName` columns to the `users` table.
2.  **Update Backend Registration**: Modify `server/src/routes/auth.ts` to:
    *   Accept `firstName` and `lastName` from the request body.
    *   Save these fields to the database during user creation.
3.  **Verify Auth Context**: Confirm `client/src/context/AuthContext.tsx` is correctly passing these fields (analysis shows it is, but we will ensure the types match).

### Phase 2: Connect Stripe & Subscription Flow
The backend has payment routes (`server/src/routes/payments.ts`), but they are not connected to the frontend.
1.  **Update Pricing Page (`client/src/pages/Pricing.tsx`)**:
    *   Replace simple `<Link>` tags with a handler that calls the backend.
    *   Implement a function to call `POST /api/create-checkout-session` with the selected `priceId`.
    *   Redirect the user to the Stripe Checkout URL returned by the server.
2.  **Configure Stripe Products**:
    *   I will verify/add the Stripe Price IDs (Basic, Pro, Enterprise) in the code (likely in `server/src/routes/payments.ts` or a config file).
3.  **Verify Webhook Handler**:
    *   Check `server/src/routes/payments.ts` to ensure the `/webhook` endpoint correctly processes `checkout.session.completed` events and updates the user's `subscriptionStatus` to `active`.

### Phase 3: Final Verification
1.  **Test Run**:
    *   Register a new user (verify Name is saved).
    *   Select a plan on the Pricing page.
    *   Simulate a successful Stripe payment.
    *   Verify the user is redirected to the Dashboard and has `active` status in the database.

**Technical Note**: I will need to use dummy Stripe keys or test mode keys if you haven't provided live ones. I will assume standard test mode behavior for verification.
