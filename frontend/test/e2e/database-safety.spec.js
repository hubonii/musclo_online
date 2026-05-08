import { test, expect } from '@playwright/test';

test.describe('Database Safety E2E', () => {
  test('rejects malicious payloads attempting SQL injection or prohibited operations', async ({ page, request }) => {
    // Try to send a malicious payload to an endpoint (e.g., settings)
    // Even if it's protected, we can check the response if we use the request context with a token
    
    // For a pure E2E test, we check if the app handles error responses gracefully
    await page.goto('/login');
    await page.fill('input[aria-label="Email or Username"]', "admin' OR 1=1 --");
    await page.fill('input[aria-label="Password"]', 'password');
    await page.click('button:has-text("Sign In")');
    
    // Should NOT redirect to dashboard
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Login failed')).toBeVisible();
  });
});
