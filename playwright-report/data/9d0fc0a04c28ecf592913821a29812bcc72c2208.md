# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should navigate to signup page
- Location: tests\auth.spec.ts:10:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Sign Up/i
Received string:  "QuickWeds | Elegant Wedding Websites & Digital Planner"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "QuickWeds | Elegant Wedding Websites & Digital Planner"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "QuickWeds Logo" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "QuickWeds Logo" [ref=e6]
      - paragraph [ref=e7]: Start your forever journey today
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Full Name
        - generic [ref=e10]:
          - img
          - textbox "John Doe" [ref=e11]
      - generic [ref=e12]:
        - text: Email Address
        - generic [ref=e13]:
          - img
          - textbox "hello@example.com" [ref=e14]
      - generic [ref=e15]:
        - text: Password
        - generic [ref=e16]:
          - img
          - textbox "********" [ref=e17]
      - button "Sign Up" [ref=e18]:
        - text: Sign Up
        - img [ref=e19]
      - generic [ref=e25]: Or continue with
      - generic [ref=e26]:
        - button "Google Google" [ref=e27]:
          - img "Google" [ref=e28]
          - text: Google
        - button "Apple" [ref=e29]:
          - img [ref=e30]
          - text: Apple
    - paragraph [ref=e32]:
      - text: Already have an account?
      - link "Log In" [ref=e33] [cursor=pointer]:
        - /url: /login
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e43]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   test('should navigate to login page', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await expect(page).toHaveTitle(/Login/i);
  7  |     await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  8  |   });
  9  | 
  10 |   test('should navigate to signup page', async ({ page }) => {
  11 |     await page.goto('/signup');
> 12 |     await expect(page).toHaveTitle(/Sign Up/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  13 |     await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  14 |   });
  15 | });
  16 | 
```