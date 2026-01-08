I will implement the missing "Contracts" and "Communication" features to address the user's high-priority issues, while also confirming the session fixes.

### 1. Enable Mock Mode for Communication
**Issue:** The user cannot test the UI because the backend returns 503 when credentials are missing.
**Plan:**
*   Modify `server/src/routes/communication.ts` to allow a "Mock Mode" if credentials are missing, instead of returning 503.
    *   This allows the frontend to fetch empty (or seeded) lists and render the UI.
    *   Add a visual indicator in the UI (via the API response) that "Mock Mode" is active, so the user knows SMS/Calls won't actually go out.

### 2. Implement Contracts UI & Templates
**Issue:** The Contracts page is blank/empty because the frontend had no error handling (fixed) and the template generation UI is missing.
**Plan:**
*   **Backend (`server/src/routes/contracts.ts`):**
    *   The route *already* has a hardcoded list of templates (`/templates`).
    *   The route *already* has a generator endpoint (`/generate/assignment`).
    *   I need to ensure `generateAssignmentContract` in `services/pdf.ts` actually works or has a fallback if the PDF library isn't set up.
*   **Frontend (`client/src/pages/Contracts.tsx`):**
    *   Add a "Generate Contract" Modal that opens when clicking a template.
    *   The modal should ask for basic info (Assignee Name, Fee) and then call the API to download the PDF.

### 3. Verify Analytics & Settings
**Issue:** Analytics was inaccessible due to session timeout.
**Plan:**
*   Now that session timeout is fixed, I will verify the `Analytics` component code to ensure it doesn't also crash on empty data (similar to Communication).

### Execution Order
1.  **Backend - Communication:** Enable Mock Mode in `server/src/routes/communication.ts`.
2.  **Frontend - Contracts:** Implement the "Generate Contract" modal in `client/src/pages/Contracts.tsx`.
3.  **Backend - PDF:** Check `server/src/services/pdf.ts` to ensure it generates a valid PDF.

I will focus on making the UI *functional* so the user can click through the workflows they described in their "User Journey" scenarios.
