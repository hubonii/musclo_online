import { test, expect } from '@playwright/test';

test.describe('AI Coach E2E', () => {
  test.beforeEach(async ({ page }) => {
    // We need to be logged in for AI chat
    // For E2E, we can use a helper or just login manually in the first test
    await page.goto('/login');
    await page.fill('input[aria-label="Email or Username"]', 'testuser@example.com');
    await page.fill('input[aria-label="Password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('user can chat with AI and save generated plans', async ({ page }) => {
    // 1. Open Chat
    const chatBtn = page.locator('button[aria-label="Musclo AI"]');
    await chatBtn.click();
    await expect(page.locator('text=Bodybuilding AI')).toBeVisible();

    // 2. Send Message
    const input = page.locator('textarea[placeholder="Ask Musclo AI..."]');
    await input.fill('Suggest a beginner workout plan');
    await page.keyboard.press('Enter');

    // 3. Verify Response (wait for streaming to finish or at least start)
    await expect(page.locator('.prose')).toBeVisible();
    
    // 4. Test "Save to Programs"
    // Since we can't guarantee the AI will return a valid JSON plan in E2E without mocking,
    // we search for the button which appears when the regex matches.
    // In a real E2E environment, the AI (or a mock AI) would need to return the expected tags.
    // Assuming the AI response includes <workout_plan_json>...
    await expect(page.locator('button:has-text("Save to Programs")')).toBeVisible({ timeout: 20000 });
    
    await page.click('button:has-text("Save to Programs")');
    await expect(page.locator('text=Saved to Programs')).toBeVisible(); // Adjust based on actual toast message
  });
});
