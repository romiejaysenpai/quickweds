# Fixing "Could not load the default credentials" on Vercel

Vercel servers don't know who is allowed to access your Firebase database. You need to give them a "Service Account" key.

## Step 1: Get the Key from Firebase

1. Go to the [Firebase Console Service Accounts page](https://console.firebase.google.com/project/call2proposal-generator/settings/serviceaccounts/adminsdk).
2. Click the **"Generate new private key"** button.
3. Confirm by clicking **"Generate key"**.
4. A JSON file will download to your computer. Open it with a text editor (Notepad, VS Code, etc.).

## Step 2: Add to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your **quickweds** project.
3. Go to **Settings** (top tab) -> **Environment Variables** (left menu).
4. Add the following two variables (copy the values *exactly* from your JSON file):

### Variable 1
- **Key:** `FIREBASE_CLIENT_EMAIL`
- **Value:** (Copy the value from `"client_email"` in the JSON file, e.g., `firebase-adminsdk-xxxxx@...`)

### Variable 2
- **Key:** `FIREBASE_PRIVATE_KEY`
- **Value:** (Copy the value from `"private_key"` in the JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)

## Step 3: Redeploy

Once you've added the variables:
1. Go to the **Deployments** tab in Vercel.
2. Click the **three dots (...)** next to your failed deployment (or the latest one).
3. Click **Redeploy**.

Your app will now have the permission it needs to work!
