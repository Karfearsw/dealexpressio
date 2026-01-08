I will address the Critical and High priority issues identified in the report.

### 1. Fix Session Management (Priority 1)
**Issue:** Users are being logged out after 10-15 minutes despite the 30-day configuration.
**Analysis:** The `cookie.maxAge` is set correctly, but `rolling: true` is missing. Without this, the session cookie's expiration is set only once at login and not updated on subsequent requests. If the browser or server clock drifts or if there are other factors, the session might be treated as expired or the cookie might not be persisting as expected.
**Plan:**
*   Modify `server/src/index.ts`:
    *   Add `rolling: true` to `sessionOptions`. This ensures the cookie expiration is reset on every response, keeping the user logged in as long as they are active.
    *   Verify `pruneSessionInterval` for `connect-pg-simple` (though default is usually fine).

### 2. Fix Blank Pages & Error Handling (Priority 1)
**Issue:** `/communication` and `/contracts` render as blank pages, likely due to unhandled API errors or undefined data crashing the React components.
**Analysis:**
*   `Communication.tsx` and `Contracts.tsx` assume the API always returns valid arrays. If the API returns an error object (e.g., due to missing SignalWire credentials), the frontend crashes when trying to `.map()` over undefined properties.
*   Missing SignalWire credentials cause the backend to potentially throw 500 errors.
**Plan:**
*   **Backend (`server/src/routes/communication.ts`):**
    *   Add checks for missing SignalWire environment variables.
    *   Return a structured error (e.g., 503 Service Unavailable) instead of crashing if credentials are missing.
*   **Frontend (`client/src/pages/Communication.tsx` & `Contracts.tsx`):**
    *   Implement robust data checking (e.g., `history?.calls?.length`) before rendering.
    *   Add a `try/catch` block in the data fetching logic to handle errors gracefully.
    *   Display a "Feature Coming Soon" or "Configuration Required" state if the API fails or returns empty data, replacing the "White Screen of Death".
*   **Global Safety:**
    *   Create a simple `ErrorBoundary` component in `client/src/components/ErrorBoundary.tsx`.
    *   Wrap critical routes in `App.tsx` with this ErrorBoundary to prevent the entire app from crashing.

### 3. Payment Flow Review (Priority 1)
**Issue:** "Test payment flow with Poof.io" is a requested action.
**Plan:**
*   Review `server/src/routes/payments.ts` and `client/src/pages/Pricing.tsx` to verify the integration logic.
*   (Note: I cannot perform a real transaction, but I will verify the code logic).

### Execution Order
1.  **Backend Fixes:** Update `server/src/index.ts` (session) and `server/src/routes/communication.ts` (env vars).
2.  **Frontend Component Fixes:** Update `Communication.tsx` and `Contracts.tsx` to handle errors.
3.  **Global Safety:** Add `ErrorBoundary`.
4.  **Verification:** Verify changes.
