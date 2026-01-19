# Deploying QuickWeds to Firebase Hosting

Since Cloud Run was giving us trouble, we will use **Firebase Hosting**'s built-in support for Next.js (Web Frameworks). This is often much smoother.

## Step 1: Install Firebase Tools
Open your terminal (Command Prompt or PowerShell) and run:

```powershell
npm install -g firebase-tools
```

## Step 2: Login to Firebase
This connects your terminal to your Google account.

```powershell
firebase login
```

## Step 3: Enable Next.js Support
This is the **most important step**. We need to tell Firebase we are deploying a dynamic Next.js app, not just static files.

```powershell
firebase experiments:enable webframeworks
```

## Step 4: Initialize the Project
Run this command and follow the prompts below:

```powershell
firebase init hosting
```

**Select these options when asked:**
1.  **Detected an existing Next.js codebase. Does this look correct?** -> **Yes**
2.  **Which Firebase project do you want to use?** -> Select **Use an existing project** -> Choose **call2proposal-generator** (or "QuickWeds" if named that).
3.  **In which region would you like to host server-side content?** -> **us-central1** (or your preferred region).
4.  **Set up automatic builds and deploys with GitHub?** -> **No** (unless you want that).

## Step 5: Deploy
Finally, send your code to the cloud:

```powershell
firebase deploy
```

Once finished, it will give you a `Hosting URL` (e.g., `https://call2proposal-generator.web.app`). That is your live site!
