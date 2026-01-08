I have analyzed the current system and confirmed that the requested features (Import/Export, Pipeline Property Tab) are not yet implemented. I have also identified that the necessary dependencies (`multer`, `csv-parser` or `papaparse`) are missing.

Here is the plan to implement the requested features:

### Phase 1: Dependencies & Backend Setup
1.  **Install Dependencies**:
    *   Server: `multer` (for file uploads), `csv-parser` (for CSV processing).
    *   Client: `papaparse` (for client-side CSV parsing/generation).
2.  **Backend Routes**:
    *   Create `POST /api/leads/import` endpoint to handle CSV upload, validate fields, and bulk insert into DB.
    *   Create `GET /api/leads/export` endpoint to stream lead data as CSV.
    *   Create `POST /api/properties/import` endpoint for property data.
    *   Create `GET /api/properties/export` endpoint.
3.  **Error Handling**: Implement `try-catch` blocks with specific error messages for malformed CSVs or validation failures.

### Phase 2: Frontend Import/Export Components
1.  **Import Component**: Create a reusable `DataImportModal` component that accepts a file, parses it (client-side validation), and sends it to the API.
2.  **Export Button**: Add an "Export CSV" button to `LeadsList` and `Properties` pages that triggers the download.
3.  **UI Integration**: Add these buttons to the headers of the Leads and Properties pages.

### Phase 3: Pipeline Property Tab & Lead Detail View
1.  **Create Lead Detail Modal**: Since no detail view exists, I will create a `LeadDetailModal` that opens when a pipeline item is clicked.
2.  **Implement Tabs**: Inside the modal, add tabs for "Details", "Property", and "Communication" (reusing the pattern from `Communication.tsx`).
3.  **Property Tab Logic**:
    *   Fetch property data associated with the lead.
    *   Display property fields (Address, ARV, etc.).
    *   Handle "No Property Found" state with an option to add one.
    *   Implement error boundaries to prevent crashes if data fails to load.

### Phase 4: Testing & Validation
1.  **Unit Tests**: Create tests for the CSV parsing logic and API endpoints.
2.  **Integration Tests**: Verify the full flow (Upload CSV -> Check DB -> Export CSV).
3.  **Error Scenarios**: Test with invalid CSV files (missing headers, wrong data types) to ensure graceful error handling.

I will begin by installing the necessary dependencies and setting up the backend routes.
