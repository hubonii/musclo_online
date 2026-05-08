import { test, expect } from '@playwright/test';

test.describe('Offline Queue E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[aria-label="Email or Username"]', 'testuser@example.com');
    await page.fill('input[aria-label="Password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('queues workout while offline and syncs when online', async ({ page, context }) => {
    // 1. Go Offline
    await context.setOffline(true);
    
    // 2. Start and Log Workout
    await page.goto('/workout'); // Adjust to actual workout start page
    // ... simulate adding sets ...
    await page.click('button:has-text("Finish Workout")');
    
    // 3. Verify Offline Banner
    const banner = page.locator('text=You\'re offline — data is cached');
    await expect(banner).toBeVisible();
    await expect(page.locator('text=1 workout pending')).toBeVisible();

    // 4. Go Online
    await context.setOffline(false);
    
    // 5. Verify Sync
    await expect(page.locator('text=Syncing pending workouts')).toBeVisible();
    await expect(banner).not.toBeVisible({ timeout: 10000 });
    
    // 6. Verify History
    await page.goto('/history');
    await expect(page.locator('.workout-card').first()).toBeVisible();
  });
});
