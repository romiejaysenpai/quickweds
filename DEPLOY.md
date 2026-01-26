# Deploying QuickWeds to Google Cloud Run

Follow these steps to deploy your application. The Service URL will be generated and displayed in your terminal at the end of Step 3.

## Step 1: Login to Google Cloud
Open your terminal (PowerShell or Command Prompt) and run:

```powershell
gcloud auth login
```
*A browser window will open. Sign in with the Google account associated with the `call2proposal-generator` project.*

## Step 2: Set the Active Project
Tell Google Cloud which project you are working on:

```powershell
gcloud config set project call2proposal-generator
```

## Step 3: Deploy the Application
Run this command to build and deploy your application. This sets all the necessary environment variables for Firebase configuration.

*Copy and paste this entire block at once:*

```powershell
gcloud run deploy quickweds `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBrAO2Hysx6hE6tvzjJcFzlICWlrqeGpYQ,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=call2proposal-generator.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=call2proposal-generator,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=call2proposal-generator.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=797334704090,NEXT_PUBLIC_FIREBASE_APP_ID=1:797334704090:web:25d2f22c6ca58109d23ae3,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-JR2C1QV9VN"
```

## Step 4: Get Your Service URL
Once the deployment finishes (it usually takes 2-3 minutes), you will see a success message like this:

```text
Service [quickweds] revision [quickweds-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://quickweds-xxxxx-uc.a.run.app
```

**That Service URL is your live link.** Click it to verify your deployed application.
