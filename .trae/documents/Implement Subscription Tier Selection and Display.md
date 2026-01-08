I will implement the requested fixes to address the missing subscription tier selection and display issues.

**1. Frontend Updates:**

* **`client/src/context/AuthContext.tsx`**:

  * Update the `User` interface to include the `subscriptionTier` field.

  * Update the `register` function signature to accept `subscriptionTier` as an argument.

* **`client/src/pages/Register.tsx`**:

  * Add a subscription tier selection dropdown (Basic, Pro, Enterprise) to the registration form.

  * Pass the selected tier to the `register` function during form submission.

* **`client/src/pages/Dashboard.tsx`**:

  * Retrieve the user's subscription tier from `useAuth` (or the API response) and display it prominently in the dashboard header or sidebar.

**2. Backend Updates:**

* **`server/src/routes/auth.ts`**:

  * Update the `/register` endpoint to accept `subscriptionTier` from the request body.

  * Save the `subscriptionTier` to the database during user creation.

  * Ensure the `/login`, `/register`, and `/me` endpoints return the `subscriptionTier` in the user object so the frontend can access it.

**3. Verification:**

* I will verify the changes by checking the code structure and ensuring the flow from registration to dashboard display carries the subscription tier correctly.

* (Note: The "Pricing Buttons" issue relates to payment configuration which requires API keys; I will focus on the tier selection and assignment first as requested).

