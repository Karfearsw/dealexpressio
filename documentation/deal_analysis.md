# Deal Analysis Workflow

DealExpress provides a powerful suite of tools to analyze real estate deals, estimate financials, and generate contracts.

## 1. Deal Calculator (Basic Access)
**Route:** `/calculator`

The Deal Calculator is available to all users. It allows you to:
- **Load Property Data**: Quickly pull ARV and Repair estimates from your saved properties.
- **Calculate MAO**: Determine your Maximum Allowable Offer based on:
  - After Repair Value (ARV)
  - Estimated Repairs
  - Your Target Assignment Fee
  - "Rule of Thumb" % (e.g., 70% rule)

## 2. Property Analysis (Pro Access)
**Route:** `/properties/:id` and `/analytics`

Pro users unlock deeper insights:
- **Advanced Financials**: Track holding costs, closing costs, and projected ROI.
- **Comparables (Coming Soon)**: Compare your deal against similar sold properties.
- **Analytics Dashboard**: Visualize your deal pipeline, total potential revenue, and conversion rates.

## 3. Generating Contracts (Pro Access)
**Route:** `/contracts` or Property Detail Page

Once you have a deal that makes sense:
1. Navigate to the **Property Detail** page.
2. Ensure your **Assignment Fee** is set.
3. Click **Generate Assignment Contract**.
4. A PDF will be generated instantly for you to send to buyers.

> **Note:** Custom contract templates are available on the Enterprise plan.

## Access Levels
| Feature | Basic | Pro | Enterprise |
| :--- | :---: | :---: | :---: |
| Deal Calculator | ✅ | ✅ | ✅ |
| Save Deals | ✅ | ✅ | ✅ |
| Analytics Dashboard | ❌ | ✅ | ✅ |
| Contract Generation | ❌ | ✅ | ✅ |
| Buyers List | ❌ | ✅ | ✅ |
