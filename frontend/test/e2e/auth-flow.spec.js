import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'E2E User',
    email: `e2e_${timestamp}@example.com`,
    username: `e2e_user_${timestamp}`,
    password: 'Password123!'
  };

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('user can register, login with both identifiers, and logout', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('input[aria-label="Name"]', testUser.name);
    await page.fill('input[aria-label="Email"]', testUser.email);
    await page.fill('input[aria-label="Username"]', testUser.username);
    await page.fill('input[aria-label="Password"]', testUser.password);
    await page.fill('input[aria-label="Confirm Password"]', testUser.password);
    await page.click('button:has-text("Sign Up")');

    // Wait for redirect to verification page
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('text=Verification Email Sent')).toBeVisible();

    // 2. Login with Email
    await page.goto('/login');
    await page.fill('input[aria-label="Email or Username"]', testUser.email);
    await page.fill('input[aria-label="Password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Logout
    await page.click('button[aria-label="Logout"], button:has-text("Sign Out")'); // Adjust selector as needed
    await expect(page).toHaveURL(/\/login/);

    // 4. Login with Username
    await page.fill('input[aria-label="Email or Username"]', testUser.username);
    await page.fill('input[aria-label="Password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
