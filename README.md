# 💍 QuickWeds - Premium Wedding Invitation & Planning Platform

QuickWeds is a sophisticated, all-in-one platform designed for modern couples to create stunning, personalized wedding invitations and manage their wedding planning journey with ease.

![QuickWeds Dashboard](/src/app/icon.png)

## ✨ Key Features

### 🎨 Premium Wedding Builder
- **Real-Time Preview**: Design your wedding website with live feedback.
- **Multiple Templates**: Choose from curated themes (Minimal, Floral, Classic, etc.).
- **Dynamic Sections**: Add Bios, Photo Galleries, Video Sections, Event Timelines, and Venue Maps.
- **Customization**: Tailor colors, typography, and content to match your wedding style.

### 📋 Smart Wedding Planner
- **Interactive Checklist**: Stay on top of every task with our organized to-do system.
- **Advanced Budget Tracker**: 
    - Real-time deduction logic (Estimates + Actual Vendor Spending).
    - Visual financial breakdown using interactive charts.
    - Currency support (USD, PHP, JPY).
- **Vendor Rolodex**: Manage all your suppliers, contracts, and payment statuses in one place.

### 📩 Seamless Guest Management & RSVP
- **Digital RSVPs**: Guests can respond directly through your wedding website.
- **Automated Notifications**: Couples receive instant email alerts via Resend when a guest RSVPs.
- **Guest List Analytics**: Track attendance, meal preferences, child counts, and song requests.
- **Export to CSV**: Easily export your guest list for seating charts or printing.

### 🌐 Professional Hosting
- **Custom Domain Integration**: Connect your own domain (e.g., `amyandjohn.com`) with automated Vercel DNS management.
- **QR Code Generation**: Every wedding gets a unique QR code for physical invitations.
- **SSL by Default**: Secure, high-performance hosting on Vercel.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), React 19, Tailwind CSS 4.
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions).
- **Styling & Assets**: Framer Motion (Animations), Lucide React (Icons), Recharts (Data Viz).
- **Communication**: [Resend](https://resend.com/) (Transactional Emails).
- **Deployment**: [Vercel](https://vercel.com/) (Cloud Functions + Static Hosting).
- **Storage**: Cloudinary (Image management).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/romiejaysenpai/quickweds.git
   cd quickweds
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   RESEND_API_KEY=your_resend_key
   CLOUDINARY_URL=your_cloudinary_url
   GHL_SIGNUP_WEBHOOK_URL=your_gohighlevel_inbound_webhook_url
   ```

4. **Apply the Seating Layout Migration**:
   If you are using the seating chart features, run the latest migration for the seating layout tables.
   - In Supabase SQL Editor: open `supabase-power-features.sql`, then execute the file.
   - Or locally, if you have a database URL available:
     ```bash
     SUPABASE_DB_URL=your_database_url npm run migrate:power-features
     ```

5. **Run for Development**:
- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

---

## 🛡️ License

Private Project - All Rights Reserved.
