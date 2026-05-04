// E2E smoke checks for public auth routes and protected-route redirects.
import { test, expect } from '@playwright/test';

test.describe('Auth and public route smoke checks', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('login route renders expected heading', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('register route renders expected heading', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  test('unknown route renders not found page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('protected route redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
});


