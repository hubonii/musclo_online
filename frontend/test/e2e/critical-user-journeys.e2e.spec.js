// End-to-end user journeys with mocked APIs for deterministic behavior.
import { test, expect } from '@playwright/test';
import { setAuthenticatedSession } from './support/authState';
import { mockAuthenticatedUser, mockSharedBootstrap } from './support/mockApi';

test.describe('Critical user journeys (mocked API)', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await setAuthenticatedSession(page);
    await mockAuthenticatedUser(page);
    await mockSharedBootstrap(page);
  });

  test('program creation journey: create a new program from Programs page', async ({ page }) => {
    const programs = [];

    await page.route('**/api/programs*', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: programs }),
        });
        return;
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() ?? {};
        const created = {
          id: 101,
          name: payload.name,
          description: payload.description,
          routines: [],
          is_active: false,
        };
        programs.push(created);

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ data: created }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/programs', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'New Program' }).click();
    await page.getByPlaceholder('e.g., Summer Cut 2026').fill('E2E Performance Block');
    await page.getByRole('button', { name: 'Save Program' }).click();

    await expect(page.getByText('E2E Performance Block')).toBeVisible();
  });

  test('program details journey: navigate into routine builder', async ({ page }) => {
    await page.route('**/api/programs/501*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 501,
            name: 'E2E Program',
            description: 'Focused progression',
            routines: [{ id: 900, name: 'Upper A', notes: '', exercises: [] }],
          },
        }),
      });
    });

    await page.route('**/api/routines/900/last-log*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null }),
      });
    });

    await page.route('**/api/exercises*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/programs/501', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Build Workout/i }).click();

    await expect(page).toHaveURL(/\/programs\/501\/routines\/new$/);
  });

  test('workout journey: start an empty workout from idle state', async ({ page }) => {
    await page.goto('/workout', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Ready to lift?' })).toBeVisible();
    await page.getByRole('button', { name: 'START EMPTY WORKOUT' }).click();

    await expect(page.getByText('Active Workout')).toBeVisible();
  });

  test('settings journey: save preferences sends updated payload', async ({ page }) => {
    let capturedUpdatePayload = null;

    await page.route('**/api/settings*', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              unit_system: 'metric',
              theme: 'dark',
              default_rest_timer_seconds: 90,
            },
          }),
        });
        return;
      }

      if (request.method() === 'PUT') {
        capturedUpdatePayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: capturedUpdatePayload }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Imperial (lbs)' }).click();
    await page.getByRole('button', { name: 'Save Settings' }).click();

    await expect.poll(() => capturedUpdatePayload).not.toBeNull();
    expect(capturedUpdatePayload.unit_system).toBe('imperial');
  });
});


