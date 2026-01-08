I have analyzed the current authentication, session, and pricing implementation. The system currently lacks a centralized way to manage feature access based on subscription tiers.

Here is the plan to implement the role-based access control (RBAC) system for enterprise and tiered accounts:

### Phase 1: Centralized Configuration
1.  **Create `server/src/config/tiers.ts`**: Define a single source of truth for subscription tiers (`Basic`, `Pro`, `Enterprise`) and their associated feature flags (e.g., `canExport`, `canManageTeam`, `maxLeads`).
2.  **Refactor Existing Logic**: Update `payments.ts` and `marketing.ts` to import from this new config file instead of using hardcoded values.

### Phase 2: Server-Side Enforcement
1.  **Enhance Middleware**: Create a new middleware `requireSubscription` in `server/src/middleware/auth.ts`.
    *   It will check the user's `subscriptionTier` against the required tier for a route.
    *   If the user lacks permission, return a `403 Forbidden` with a specific error code (e.g., `TIER_RESTRICTED`).
2.  **Protect Routes**: Apply this middleware to premium routes (e.g., Bulk Import/Export, Team Management).

### Phase 3: Client-Side Access Control
1.  **Update `AuthContext`**: Ensure the `user` object includes the full `subscriptionTier` and derived permissions.
2.  **Create `RestrictedFeature` Component**: A wrapper component that checks the user's tier.
    *   If allowed: Renders children normally.
    *   If restricted: Renders a "Coming Soon / Upgrade to Access" placeholder UI.
3.  **Update Sidebar**: Modify `Sidebar.tsx` to visually indicate restricted features (e.g., lock icon) rather than hiding them completely, to encourage upgrades.

### Phase 4: Registration Flow Updates
1.  **Pass Tier Selection**: Ensure the registration flow correctly captures the selected plan from the Pricing page.
2.  **Immediate Access**: Upon account creation, set the user's tier immediately in the session so they land on the dashboard with the correct permissions active.

### Phase 5: Enterprise "Coming Soon" Logic
1.  **Feature Flags**: Implement a `features` object in the tier config.
2.  **Enterprise Handling**: For Enterprise users, if a feature is technically not built yet (like "AI Scoring"), the `RestrictedFeature` component will display a "Coming Soon" message instead of an "Upgrade" message.

I will begin by creating the centralized tier configuration.
