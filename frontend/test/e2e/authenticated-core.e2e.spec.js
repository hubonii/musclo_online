// Core authenticated E2E flows using mocked API responses.
import { test, expect } from '@playwright/test';
import { setAuthenticatedSession } from './support/authState';

async function mockAuthUser(page) {
  await page.route('**/api/user*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 1,
          name: 'E2E User',
          email: 'e2e@example.com',
        },
      }),
    });
  });
}

async function mockAppBootstrap(page) {
  // Registers shared startup API mocks for authenticated route navigation.
  await page.route('**/api/settings*', async (route) => {
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
  });

  await page.route('**/api/workouts/history*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/workouts/stats*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          workouts: {
            total: 0,
            this_week: 0,
          },
          volume: {
            total_kg: 0,
          },
          time: {
            total_seconds: 0,
          },
          recent_programs: [],
          recent_routines: [],
        },
      }),
    });
  });

  await page.route('**/api/measurements*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/progress-photos*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/routines/today*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    });
  });
}

test.describe('Authenticated core flow checks', () => {
  test('programs route is reachable with authenticated session', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);
    await page.route('**/api/programs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.goto('/programs', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/programs$/);
    await expect(page.getByRole('heading', { name: 'Programs', exact: true })).toBeVisible();
  });

  test('settings route is reachable with authenticated session', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);
    await page.route('**/api/settings*', async (route) => {
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
    });
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('history route is reachable with authenticated session', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);
    await mockAppBootstrap(page);
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/history$/);
    await expect(page.getByRole('heading', { name: 'History', exact: true })).toBeVisible();
  });

  test('dashboard route stays protected but accessible after mocked auth', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);
    await mockAppBootstrap(page);
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('button', { name: 'Start Empty Workout' })).toBeVisible();
  });

  test('program workflow can create a new program from the modal', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);

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
          id: 501,
          name: payload.name ?? 'Untitled Program',
          description: payload.description ?? '',
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
    await expect(page).toHaveURL(/\/programs$/);

    await page.getByRole('button', { name: 'New Program' }).click();
    await page.getByPlaceholder('e.g., Summer Cut 2026').fill('E2E Strength Block');
    await page.getByRole('button', { name: 'Save Program' }).click();

    await expect(page.getByText('E2E Strength Block')).toBeVisible();
  });

  test('workout workflow can start an empty workout from idle state', async ({ page }) => {
    await setAuthenticatedSession(page);
    await mockAuthUser(page);
    await mockAppBootstrap(page);
    await page.goto('/workout', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Ready to lift?' })).toBeVisible();
    await page.getByRole('button', { name: 'START EMPTY WORKOUT' }).click();

    await expect(page.getByText('Active Workout')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  });
});


