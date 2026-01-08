I will fix the identified issues in `BuyersList.tsx` and `DealCalculator.tsx`.

### 1. Buyers List - Fix "Add Buyer" Modal
**File:** `client/src/pages/BuyersList.tsx`
- **Goal:** Implement the missing "Add Buyer" modal functionality.
- **Changes:**
  - Add state for `showModal` and `newBuyer` (name, email, phone, criteria).
  - Create a `handleCreateBuyer` function to POST data to `/api/buyers` and update the local list.
  - Add the Modal UI component (adapting the style from `Leads.tsx`).
  - Connect the "Add Buyer" button to open the modal.

### 2. Deal Calculator - Fix Currency Formatting
**File:** `client/src/pages/DealCalculator.tsx`
- **Goal:** Correct the MAO display formatting and ensure consistent currency representation.
- **Changes:**
  - Update the MAO display to use `.toLocaleString('en-US', { style: 'currency', currency: 'USD' })` to ensure it shows as `$150,000.00` instead of ambiguous formats.
  - Apply the same consistent currency formatting to "Your Fee" and "Investor Buy Price" displays.
