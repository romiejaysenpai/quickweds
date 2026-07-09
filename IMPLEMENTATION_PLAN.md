# QuickWeds Implementation Plan - Coordinator Handoff Report

Introduce a one-click coordinator handoff report tool so couples can generate a clean, print-friendly browser report and PDF containing all critical event logistics right before the wedding day.

## Proposed Changes

### UI & Styling

#### [NEW] [page.tsx](file:///c:/Users/romie/quickweds/quickweds/src/app/dashboard/[id]/handoff/page.tsx)
Create a new dashboard page that loads all logistical data for the wedding and renders a printable layout.

- **Data Loading**:
  - Load wedding details (`weddings` table).
  - Load confirmed guests (`rsvps` table where `rsvp_status = 'confirmed'` or `attendance = 'Yes'`).
  - Load seating tables (`seating_tables`) and guest seat assignments (`seating_assignments`).
  - Load vendors (`planner_vendors`).
  - Load timeline events (`planner_events` sorted by `starts_at` ascending).
  - Load emergency contacts and coordinator notes (`wedding_day_settings`).
- **Interactive Controls (Hidden on Print)**:
  - Toggles for each section to customize the printed packet (e.g., "Include Guest List", "Include Seating Chart", etc.).
  - A big, styled "Print / Save PDF" button invoking `window.print()`.
  - A back button linking back to the wedding-day settings dashboard.
- **Print Optimization**:
  - CSS style definitions targeting `@media print` to hide headers, sidebars, customization toggles, and buttons.
  - Reset backgrounds, paddings, and borders to look clean on standard A4/Letter size paper.
  - Page-break controls (`break-before: page` or `page-break-before: always`) before major sections so that the PDF flows naturally without awkward mid-page splits.
  - Ensure table rows do not split across pages (`break-inside: avoid`).

#### [MODIFY] [page.tsx](file:///c:/Users/romie/quickweds/quickweds/src/app/dashboard/[id]/page.tsx)
- Add a new "Handoff Report" link with a `Printer` icon in the right-side drawer sidebar menu under the "Tools & Planning" section.

#### [MODIFY] [page.tsx](file:///c:/Users/romie/quickweds/quickweds/src/app/dashboard/[id]/wedding-day/page.tsx)
- Import the `Printer` icon from `lucide-react`.
- Add a "Handoff Report" ActionCard to the grid section:
  ```tsx
  <ActionCard href={`/dashboard/${weddingId}/handoff`} icon={Printer} label="Handoff Report" description="Print coordinator PDF packet." />
  ```
- Change the action cards grid layout to support the fifth card:
  - Update `sm:grid-cols-2 lg:grid-cols-4` to `sm:grid-cols-2 lg:grid-cols-5` (or let it automatically wrap with `flex flex-wrap` / grid columns).

---

## Report Sections Design

1. **Cover / Summary Page**:
   - Header displaying couple names, date, time, primary venue name, and address.
   - Quick-reference panel showing emergency contacts.
   - Custom operational notes / coordinator notes.
2. **Timeline / Agenda**:
   - A sequential program timeline table with start time, end time, location, event title, and coordinator/operational notes.
3. **Final Guest List**:
   - Total count summary (Confirmed Guests, Checked In, Seated, Dietary Restrictions).
   - Guest listing table containing: Guest Name, Guest Group, Table Assignment, Meal Preference, Dietary/Allergy Details, and Plus-One status/names.
4. **Seating Chart**:
   - List of all tables with name, capacity, number of guests assigned, and the list of guests seated there.
5. **VIP Notes**:
   - Dedicated table or grid containing guests in the `VIP` group. Displays name, table, meal preference, dietary restrictions, and their custom guest message/notes.
6. **Allergies & Dietary Details**:
   - Listing of guests who have specified `dietary_details`. Displays name, group, table, and their specific dietary details / restrictions.
7. **Vendor Directory**:
   - Listing of vendors containing: Supplier Name, Role, Phone, Email, Payment Status, Payment Method, Amount, and Notes.
8. **Unpaid Balances**:
   - Summary of financial health (Total Budget, Committed/Spent, Unpaid Balance).
   - List of unpaid or partially paid budgets (`planner_budgets` where `is_paid = false`).
   - List of unpaid or partially paid vendors (`planner_vendors` where `payment_status != 'paid'`).

---

## Verification Plan

### Automated Checks
- Run `npm run lint` to ensure no linting errors.
- Run `npm run build` to verify Next.js compiles the new page cleanly.

### Manual Verification
- Access `/dashboard/[weddingId]/handoff` for a wedding and check if all lists load correctly.
- Test customization toggles: toggling off "Timeline" should hide the Timeline section from both the preview and the printout.
- Verify print layouts using the browser's Print Preview (`Ctrl+P` or click "Print Report"):
  - Verify that UI controls, drawer, back buttons, and navigation bar are hidden on the printed sheet.
  - Verify that section headers start on a new page (checking page breaks).
  - Verify that page orientation (portrait) and fonts render beautifully.
- Test edge cases:
  - Empty states (e.g. no vendors, no seating tables, no guest lists, no events).
  - Extremely long notes or dietary details (ensure text wraps properly and doesn't clip).
  - Check access permissions: ensure coordinators, partners, and owners can view the page, but unauthenticated users are redirected or denied.
