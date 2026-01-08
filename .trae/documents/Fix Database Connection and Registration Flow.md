# Database Connection and Registration Fix Plan

## 1. Database Configuration
- Create/Update `server/.env` with the provided PostgreSQL connection string.
- Ensure the connection string includes `sslmode=require`.

## 2. Backend Registration Logic (`server/src/routes/auth.ts`)
- **Fix Race Condition**: Modify the `/register` endpoint to handle concurrent registration attempts.
  - Instead of relying solely on `SELECT` before `INSERT`, catch the database unique constraint violation error (code `23505`).
  - Return a `409 Conflict` status code when a user already exists.
- **Improve Error Handling**:
  - Add specific error messages for database errors.
  - Add structured logging (timestamp, error details) for debugging.
- **Validation**:
  - Verify that the existing validation logic covers all requirements.

## 3. Frontend Registration Flow (`client/src/pages/Register.tsx`)
- Review error handling to ensure `409` errors are displayed clearly to the user (e.g., "Email already registered. Please sign in.").
- Ensure the UI provides immediate feedback.

## 4. Verification
- **Test Script**: Create a script to simulate concurrent registrations and verify that data integrity is maintained (no duplicate emails).
- **Manual Test**: Verify successful registration and login.
