@echo off
echo Setting up Git repository for QuickWeds...
echo.

REM Initialize git repository
git init

REM Add all files
git add .

REM Create initial commit
git commit -m "Initial commit - QuickWeds wedding invitation platform"

REM Rename branch to main
git branch -M main

echo.
echo Git repository initialized!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub.com named "quickweds"
echo 2. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/quickweds.git)
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo.
pause
