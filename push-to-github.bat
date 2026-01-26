@echo off
echo ========================================
echo  QuickWeds - GitHub Push Script
echo ========================================
echo.

REM Navigate to project directory
cd /d "C:\Users\romie\quickweds"

REM Initialize git repository
echo [1/6] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please restart your computer after installing Git
    pause
    exit /b 1
)

REM Add all files
echo [2/6] Adding all files...
git add .

REM Create initial commit
echo [3/6] Creating initial commit...
git commit -m "Initial commit - QuickWeds wedding invitation platform"

REM Rename branch to main
echo [4/6] Setting main branch...
git branch -M main

REM Add remote origin
echo [5/6] Connecting to GitHub...
git remote add origin https://github.com/romiejaysenpai/quickweds.git

REM Push to GitHub
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo  SUCCESS! Code pushed to GitHub
echo  Repository: https://github.com/romiejaysenpai/quickweds
echo ========================================
echo.
pause
