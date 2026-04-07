@echo off
cd C:\Users\romie\quickweds

echo ========================================
echo QuickWeds Landing Page Deployment
echo ========================================
echo.

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Staging changes...
git add .
echo Changes staged.
echo.

echo [3/4] Committing changes...
git commit -m "Fix landing page: newsletter form, WhatsApp link, social media, and footer links"
if %ERRORLEVEL% NEQ 0 (
    echo Error during commit. Checking if there are changes...
    git status
)
echo.

echo [4/4] Pushing to GitHub...
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo Vercel deployment starting...
    echo Monitor at: https://vercel.com/quickweds
    echo.
) else (
    echo Error pushing to GitHub. Check your connection.
)

pause
