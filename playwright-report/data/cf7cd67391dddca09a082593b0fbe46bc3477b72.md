# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should navigate to login page
- Location: tests\auth.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Login/i
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
      - paragraph [ref=e7]: Continue creating your dream wedding
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Email Address
        - generic [ref=e10]:
          - img
          - textbox "hello@example.com" [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - link "Forgot?" [ref=e15] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e16]:
          - img
          - textbox "********" [ref=e17]
      - button "Login" [ref=e18]:
        - text: Login
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
      - text: Don't have an account?
      - link "Sign Up" [ref=e33] [cursor=pointer]:
        - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - generic [ref=e42]:
      - text: Compiling
      - generic [ref=e43]:
        - generic [ref=e44]: .
        - generic [ref=e45]: .
        - generic [ref=e46]: .
  - alert [ref=e47]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   test('should navigate to login page', async ({ page }) => {
  5  |     await page.goto('/login');
> 6  |     await expect(page).toHaveTitle(/Login/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  7  |     await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  8  |   });
  9  | 
  10 |   test('should navigate to signup page', async ({ page }) => {
  11 |     await page.goto('/signup');
  12 |     await expect(page).toHaveTitle(/Sign Up/i);
  13 |     await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  14 |   });
  15 | });
  16 | 
```