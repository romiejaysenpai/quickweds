# Fixing "Could not load the default credentials" on Vercel

Vercel servers don't know who is allowed to access your Firebase database. You need to give them a "Service Account" key.

## Step 1: Get the Key from Firebase

1. Go to the [Firebase Console Service Accounts page](https://console.firebase.google.com/project/call2proposal-generator/settings/serviceaccounts/adminsdk).
2. Click the **"Generate new private key"** button.
3. Confirm by clicking **"Generate key"**.
4. A JSON file will download to your computer. Open it with a text editor (Notepad, VS Code, etc.).

### Step 2: Add Public Firebase Variables to Vercel

These variables are required for the login and signup pages to work.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your **quickweds** project.
3. Go to **Settings** -> **Environment Variables**.
4. Add the following variables (you can find these in your `.env.production` file):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Step 3: Add Admin Credentials to Vercel
- **Key:** `FIREBASE_CLIENT_EMAIL`
- **Value:** (Copy the value from `"client_email"` in the JSON file, e.g., `firebase-adminsdk-xxxxx@...`)

### Variable 2
- **Key:** `FIREBASE_PRIVATE_KEY`
- **Value:** (Copy the value from `"private_key"` in the JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)

## Step 4: Redeploy

Once you've added the variables:
1. Go to the **Deployments** tab in Vercel.
2. Click the **three dots (...)** next to your failed deployment (or the latest one).
3. Click **Redeploy**.

Your app will now have the permission it needs to work!
