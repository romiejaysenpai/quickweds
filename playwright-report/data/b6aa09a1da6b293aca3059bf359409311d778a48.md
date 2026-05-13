# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.ts >> Wedding Builder >> should load the builder steps
- Location: tests\builder.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Wedding Details/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Wedding Details/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - link "QuickWeds Logo" [ref=e15] [cursor=pointer]:
        - /url: /
        - img "QuickWeds Logo" [ref=e16]
      - paragraph [ref=e17]: Continue creating your dream wedding
    - generic [ref=e18]:
      - generic [ref=e19]:
        - text: Email Address
        - generic [ref=e20]:
          - img
          - textbox "hello@example.com" [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Password
          - link "Forgot?" [ref=e25] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e26]:
          - img
          - textbox "********" [ref=e27]
      - button "Login" [ref=e28]:
        - text: Login
        - img [ref=e29]
      - generic [ref=e35]: Or continue with
      - generic [ref=e36]:
        - button "Google Google" [ref=e37]:
          - img "Google" [ref=e38]
          - text: Google
        - button "Apple" [ref=e39]:
          - img [ref=e40]
          - text: Apple
    - paragraph [ref=e42]:
      - text: Don't have an account?
      - link "Sign Up" [ref=e43] [cursor=pointer]:
        - /url: /signup
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Wedding Builder', () => {
  4  |   test('should load the builder steps', async ({ page }) => {
  5  |     // Note: This test assumes the user is logged in or can access the builder
  6  |     await page.goto('/builder');
  7  |     
  8  |     // Check if the first step is active
> 9  |     await expect(page.getByText(/Wedding Details/i)).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  10 |     await expect(page.getByPlaceholder(/Sarah/i)).toBeVisible(); // Bride Name
  11 |     
  12 |     // Check if "Next" button is visible
  13 |     await expect(page.getByRole('button', { name: /Next/i })).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should show floating preview button on mobile', async ({ page }) => {
  17 |     // Set viewport to mobile size
  18 |     await page.setViewportSize({ width: 375, height: 667 });
  19 |     await page.goto('/builder');
  20 |     
  21 |     // The smartphone icon button should be visible
  22 |     const previewToggle = page.locator('button:has(svg.lucide-smartphone)');
  23 |     await expect(previewToggle).toBeVisible();
  24 |   });
  25 | });
  26 | 
```