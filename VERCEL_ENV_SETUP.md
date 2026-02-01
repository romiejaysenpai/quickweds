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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your anon public API key)

## Step 3: Deployment

Once the variables are added:
1. Go to the **Deployments** tab.
2. Click the **three dots (...)** next to the latest deployment.
3. Select **Redeploy**.

---

### Note on Storage
Ensure you have a storage bucket named `quickweds` in your Supabase project and that its policy is set to **Public** for allowed reads and writes (or appropriately restricted if you've set up RLS).
