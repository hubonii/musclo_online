// Optional live E2E flow against a running backend (no API mocking).
import { test, expect } from '@playwright/test';

const fullE2eEnabled = process.env.FULL_E2E_ENABLED === '1';

test.describe('Full stack live flow', () => {
  // Opt-in guard avoids running live flow in normal CI/local unit test runs.
  test.skip(!fullE2eEnabled, 'Set FULL_E2E_ENABLED=1 and run backend API before running this live flow.');

  // Covers real register -> dashboard -> program creation path against live backend.
  test('registers a user and creates a program without API mocks', async ({ page }) => {
    const uniq = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const email = `e2e-${uniq}@example.com`;
    const password = 'Secret123!';
    const programName = `E2E Program ${uniq}`;

    await page.goto('/register');

    await page.getByLabel('Name').fill('E2E Live User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/programs');
    await page.getByRole('button', { name: 'New Program' }).click();
    await page.getByPlaceholder('e.g., Summer Cut 2026').fill(programName);
    await page.getByRole('button', { name: 'Save Program' }).click();

    await expect(page.getByText(programName)).toBeVisible();
  });
});


