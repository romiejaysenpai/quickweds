const { execSync } = require('child_process');
const path = require('path');

const projectDir = 'C:\\Users\\romie\\quickweds';

console.log('========================================');
console.log(' QuickWeds - Mobile Optimization Deploy');
console.log('========================================\n');

try {
  process.chdir(projectDir);

  console.log('[1/5] Checking git status...');
  const status = execSync('git status --short', { encoding: 'utf-8' });
  console.log(status);

  console.log('[2/5] Adding all changes...');
  execSync('git add .', { encoding: 'utf-8' });
  console.log('✓ Files staged\n');

  console.log('[3/5] Committing changes...');
  const commitMessage = `feat: Complete mobile optimization for iOS and Android

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

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  console.log('✓ Commit created\n');

  console.log('[4/5] Pushing to GitHub...');
  execSync('git push -u origin main', { encoding: 'utf-8', stdio: 'inherit' });
  console.log('✓ Pushed to GitHub\n');

  console.log('========================================');
  console.log(' SUCCESS! Changes deployed');
  console.log('========================================\n');
  console.log('✓ Changes pushed to GitHub');
  console.log('✓ Vercel will auto-deploy from the push\n');
  console.log('Repository: https://github.com/romiejaysenpai/quickweds');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
}
