# Pushing QuickWeds to GitHub

Since Git isn't installed on your system, here's the easiest way to get your code on GitHub:

## Option 1: Using GitHub Desktop (Recommended - No Command Line)

1. **Download GitHub Desktop:** https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Click "Add" → "Add Existing Repository"**
4. **Browse to:** `C:\Users\romie\quickweds`
5. **Click "Publish repository"**
6. Name it "quickweds" and click "Publish"

Done! Your code is now on GitHub.

## Option 2: Using VS Code (If you have it)

1. Open VS Code
2. Open the `quickweds` folder
3. Click the **Source Control** icon (left sidebar)
4. Click **"Initialize Repository"**
5. Click **"Publish to GitHub"**
6. Sign in and follow the prompts

## Option 3: Install Git and use Command Line

1. Download Git: https://git-scm.com/download/win
2. Install it (use default settings)
3. Open a new terminal and run:

```cmd
cd C:\Users\romie\quickweds
git init
git add .
git commit -m "Initial commit - QuickWeds wedding invitation app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quickweds.git
git push -u origin main
```

(Replace YOUR_USERNAME with your GitHub username)

---

## Your Live App

Your app is already deployed and live at:
**https://quickweds.vercel.app**

You can share this link with anyone!
