# Fixing "Could not load the default credentials" on Vercel

Vercel servers don't know who is allowed to access your Firebase database. You need to give them a "Service Account" key.

## Step 1: Get the Key from Firebase

1. Go to the [Firebase Console Service Accounts page](https://console.firebase.google.com/project/call2proposal-generator/settings/serviceaccounts/adminsdk).
2. Click the **"Generate new private key"** button.
3. Confirm by clicking **"Generate key"**.
4. A JSON file will download to your computer. Open it with a text editor (Notepad, VS Code, etc.).

---

## Step 2: Add Public Firebase Variables to Vercel

**CRITICAL:** These must be added for the Login/Signup pages to work in the browser.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your **quickweds** project.
3. Go to **Settings** -> **Environment Variables**.
4. Add the following variables (values are in your Firebase Console project settings):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Step 3: Add Admin Credentials to Vercel

This allows the server to save wedding data and RSVPs.

### Option A: Using Service Account JSON (Recommended)
1. **Key:** `FIREBASE_SERVICE_ACCOUNT`
2. **Value:** (Copy the ENTIRE text from the `.json` file you downloaded in Step 1)

**OR**

### Option B: Using Individual Variables
- **Key:** `FIREBASE_CLIENT_EMAIL` -> (Value of `"client_email"` from the JSON)
- **Key:** `FIREBASE_PRIVATE_KEY` -> (Value of `"private_key"` from the JSON, include the BEGIN/END lines)

---

## Step 4: Redeploy

Once you've added the variables:
1. Go to the **Deployments** tab in Vercel.
2. Click the **three dots (...)** next to the latest deployment.
3. Click **Redeploy**.
