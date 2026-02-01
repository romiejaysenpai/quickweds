# Supabase Environment Setup for Vercel

To ensure your wedding platform works correctly on Vercel, you need to add your Supabase credentials to the Vercel Environment Variables.

## Step 1: Get Supabase Credentials

1. Go to your [Supabase Project Settings](https://supabase.com/dashboard/project/_/settings/api).
2. Copy the **Project URL** and the **anon public** API key.

## Step 2: Add Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your **quickweds** project.
3. Go to **Settings** -> **Environment Variables**.
4. Add the following keys:

- `NEXT_PUBLIC_SUPABASE_URL`: (Your Project URL)
---

## Step 4: Storage Configuration (Crucial for Videos)

By default, Supabase limits file uploads to 50MB. Since we support up to 500MB HD videos, you **MUST** increase this limit:

1. Go to your [Supabase Storage Buckets](https://supabase.com/dashboard/project/_/storage/buckets).
2. Find the `quickweds` bucket and click the **three dots (...)** -> **Edit bucket**.
3. Scroll down to **Maximum File Size**.
4. Change it from `50MB` to `500MB` (or more if needed).
5. Click **Save**.

### Note on Storage Policies
Ensure you have a storage bucket named `quickweds` in your Supabase project. If you are getting "Permission Denied" errors, make sure you have created an **RLS Policy** that allowed `INSERT` and `SELECT` for authenticated (or anonymous, depending on your needs) users.
