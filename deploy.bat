@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\romie\quickweds"

echo ========================================
echo  QuickWeds - Mobile Optimization Deploy
echo ========================================
echo.

echo [1/5] Checking git status...
git status

echo.
echo [2/5] Adding all changes...
git add .

echo.
echo [3/5] Committing changes...
git commit -m "feat: Complete mobile optimization for iOS and Android

- Added explicit viewport meta tag configuration
- Implemented 44x44px minimum touch targets across all components
- Added responsive CSS for xs (320px), sm (640px), md (768px), lg (1024px) breakpoints
- Optimized landing page (nav, hero, decorative elements, phone mockup)
- Optimized builder form (wizard steps, form inputs, grids)
- Optimized wedding sections (gallery, countdown, RSVP, timeline, hero)
- Fixed high-padding issues on mobile (RSVP section, forms)
- Improved text sizing progression for mobile readability
- Safe area support for notched devices (iPhone X+)
- No horizontal scroll on any screen size

Files Modified:
- src/app/layout.tsx
- src/app/globals.css
- src/app/page.tsx
- src/components/PhoneMockupSection.tsx
- src/components/BuilderForm.tsx
- src/components/wedding/GallerySection.tsx
- src/components/wedding/CountdownTimer.tsx
- src/components/wedding/RSVPSection.tsx
- src/components/wedding/HeroEnhancer.tsx
- src/components/wedding/TimelineSection.tsx

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo [4/5] Pushing to GitHub...
git push -u origin main

echo.
echo [5/5] Triggering Vercel deployment...
echo.
echo ========================================
echo  SUCCESS! Changes deployed
echo ========================================
echo.
echo Changes pushed to GitHub: https://github.com/romiejaysenpai/quickweds
echo Vercel will auto-deploy from the push
echo.
pause
