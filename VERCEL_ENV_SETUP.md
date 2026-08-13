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

## Step 3: Add Vercel API Keys for Custom Domains

To allow your users to connect their own domains (like via Namecheap), you need to provide your Vercel Project ID and an Access Token:

1. **Vercel Access Token**: Go to **Settings** -> **Tokens** in your Vercel Account. Create a new token and copy it.
   - Variable name: `VERCEL_TOKEN`
2. **Vercel Project ID**: Go to your project's **Settings** -> **General** on Vercel. Scroll to find the **Project ID**.
   - Variable name: `VERCEL_PROJECT_ID`

Add these keys to your Vercel Environment Variables so the domain features work.

---

## Step 4: Storage upload limits

QuickWeds does not assume a Supabase default bucket limit. The app defaults are configured in `src/lib/media-upload.ts` and can be overridden at build time with public byte-value environment variables:

- `NEXT_PUBLIC_MAX_IMAGE_UPLOAD_SIZE_BYTES` (default: 10 MiB)
- `NEXT_PUBLIC_MAX_IMAGE_SOURCE_SIZE_BYTES` (default: 25 MiB before browser compression)
- `NEXT_PUBLIC_MAX_VIDEO_UPLOAD_SIZE_BYTES` (default: 50 MiB)

If you change an app limit, confirm that it is no greater than both the **Global file size limit** in Supabase Storage Settings and the `quickweds` bucket's optional **Restrict file size** setting. Bucket/global limits are configured in the Supabase Dashboard and take precedence over QuickWeds.


### Note on Storage Policies
Ensure you have a storage bucket named `quickweds`. Do not add anonymous write policies for guest photos: Photo Portal guests receive a short-lived, object-scoped signed upload URL only after their sharing code has been validated.
