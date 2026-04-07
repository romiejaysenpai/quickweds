#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\romie\\quickweds';
process.chdir(projectDir);

console.log('========================================');
console.log('QuickWeds Landing Page Deployment');
console.log('========================================\n');

try {
  // Step 1: Git Status
  console.log('[1/4] Checking git status...');
  const status = execSync('git status', { encoding: 'utf8' });
  console.log(status);

  // Step 2: Stage changes
  console.log('[2/4] Staging changes...');
  execSync('git add .', { encoding: 'utf8' });
  console.log('✓ Changes staged.\n');

  // Step 3: Commit
  console.log('[3/4] Committing changes...');
  try {
    const commitOutput = execSync('git commit -m "Fix landing page: newsletter form, WhatsApp link, social media, and footer links"', { 
      encoding: 'utf8'
    });
    console.log(commitOutput);
  } catch (err) {
    if (err.message.includes('nothing to commit')) {
      console.log('No changes to commit.\n');
    } else {
      throw err;
    }
  }

  // Step 4: Push to GitHub
  console.log('[4/4] Pushing to GitHub...');
  const pushOutput = execSync('git push origin main', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(pushOutput);

  console.log('========================================');
  console.log('✓ Successfully pushed to GitHub!');
  console.log('========================================\n');
  console.log('Vercel deployment starting...');
  console.log('Monitor at: https://vercel.com/quickweds\n');
  console.log('Deployment should complete in 2-5 minutes.');
  console.log('Check console output at: https://vercel.com/quickweds/quickweds/deployments\n');

} catch (error) {
  console.error('❌ Error during deployment:');
  console.error(error.message);
  process.exit(1);
}
