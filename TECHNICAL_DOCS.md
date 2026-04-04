# 🛠️ QuickWeds Technical Documentation

This document provides a deep dive into the architecture, data models, and technical workflows of the QuickWeds platform.

## 🏗️ Architecture Overview

QuickWeds is built as a modern full-stack application using **Next.js 15 (App Router)** and **Supabase**.

### Component Hierarchy
- **App Router (`/src/app`)**: Handles routing, server-side data fetching, and page layouts.
- **Components (`/src/components`)**: 
  - `BuilderForm.tsx`: Complex state management for the multi-step wedding builder.
  - `wedding/`: Modular sections used to compose the final wedding landing pages.
- **Lib (`/src/lib`)**: Shared utilities like `supabase.ts` for database client initialization.

---

## 📊 Database Schema (Supabase)

### 1. `weddings` Table
The core record for every wedding.
- `id` (UUID): Primary Key.
- `bride_name`, `groom_name` (TEXT).
- `wedding_date` (DATE), `wedding_time` (TIME).
- `total_budget` (NUMERIC): The overall budget limit set by the couple.
- `currency` (TEXT): Default 'USD'. Options: 'USD', 'Peso', 'Yen'.
- `custom_domain` (TEXT): Managed via Vercel integration.

### 2. `rsvps` Table
- `id` (UUID).
- `wedding_id` (TEXT): Reference to `weddings`.
- `guest_name` (TEXT).
- `attendance` (TEXT): 'Yes', 'No', or 'Maybe'.
- `num_guests` (INTEGER): Total headcount for the party.
- `meal_preference` (TEXT).

### 3. `planner_budgets` Table (Budget Estimates)
- `category` (TEXT): e.g., 'Venue', 'Catering'.
- `item_name` (TEXT): e.g., 'Hall Rental'.
- `estimated_cost` (NUMERIC).

### 4. `planner_vendors` Table (Actual Spending)
- `role` (TEXT): e.g., 'Photographer'.
- `amount` (NUMERIC): Negotiated/Paid amount.
- `payment_status` (TEXT): 'pending' or 'paid'.

---

## 📡 API Endpoints (`/src/pages/api`)

### `rsvp-notify.ts`
- **Method**: `POST`
- **Function**: Triggered by the RSVP form. Uses **Resend** to email the couple.
- **Payload**: Contains guest name, attendance status, and meal choices.

### `domains`
- **Method**: `GET`, `POST`, `DELETE`
- **Function**: Proxies requests to the Vercel API to buy/assign/remove custom domains programmatically.

---

## 💡 Key Workflows

### Budget Deduction Logic
The application uses a **Consolidated Financial Engine**:
1. It aggregates all `estimated_cost` from `planner_budgets`.
2. It aggregates all `amount` from `planner_vendors` where status is `paid`.
3. It subtracts both from the `weddings.total_budget` to show the final **Remaining Cash**.

### Custom Domain Workflow
1. User enters domain in Dashboard.
2. API calls Vercel to assign the domain to the project.
3. User is shown specific DNS records (A/CNAME).
4. Vercel automatically verifies and provisions an SSL certificate.

---

## 🔧 Maintenance & Fixes

### Database Permissions (RLS)
The wedding planner tables require Public access for basic CRUD when not using full Auth. Use the supplied `sql` scripts in the `supabase-permissions-fix.sql` file to ensure the Dashboard can update the `weddings` table.

### Deployment
Always deploy to Vercel using the `--prod` flag to ensure environment variables and custom domains are correctly mapped.

```bash
npx vercel --prod
```
