// E2E coverage for major feature pages using stable mocked responses.
import { test, expect } from '@playwright/test';
import { setAuthenticatedSession } from './support/authState';

async function mockAuthAndShared(page) {
  // Minimal auth/bootstrap routes required by most protected pages.
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
}

test.describe('Feature pages coverage', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await setAuthenticatedSession(page);

    await mockAuthAndShared(page);
  });

  test('exercises page renders search and exercise cards area', async ({ page }) => {
    await page.route('**/api/exercises*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 10,
              name: 'Push Up',
              body_part: 'Chest',
              muscle_group: 'chest',
              equipment: 'Body Weight',
              gif_url: '/storage/exercises/pushup.gif',
            },
          ],
        }),
      });
    });

    await page.goto('/exercises', { waitUntil: 'domcontentloaded' });

    await expect(page.getByPlaceholder('Search for exercises')).toBeVisible();
    await expect(page.getByText('Push Up')).toBeVisible();
  });

  test('progress page renders timeline with empty sessions', async ({ page }) => {
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

    await page.goto('/progress', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Progress Timeline' })).toBeVisible();
    await expect(page.getByText('No photos yet')).toBeVisible();
  });

  test('profile page renders user stats and trophy section', async ({ page }) => {
    await page.route('**/api/profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            name: 'E2E User',
            bio: 'Testing profile flow',
            level: { number: 2, title: 'Novice', progress: 20 },
            stats: { total_workouts: 3, total_volume: 1200, current_streak: 2 },
          },
        }),
      });
    });

    await page.route('**/api/profile/me/achievements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/api/profile/me/routines', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'E2E User' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trophy Cabinet' })).toBeVisible();
  });

  test('program details route renders and can navigate to builder', async ({ page }) => {
    await page.route('**/api/programs/501*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 501,
            name: 'E2E Program',
            description: 'Coverage program',
            routines: [
              { id: 900, name: 'Upper A', notes: '', exercises: [] },
            ],
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
    await expect(page.getByRole('heading', { name: 'E2E Program' })).toBeVisible();

    await page.getByRole('button', { name: /Build Workout/i }).click();
    await expect(page).toHaveURL(/\/programs\/501\/routines\/new$/);
  });

  test('workout detail route renders analytics and breakdown', async ({ page }) => {
    await page.route('**/api/workouts/777*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 777,
            routine_id: 900,
            name: 'Leg Day',
            started_at: '2026-04-01T10:00:00.000Z',
            duration_seconds: 1800,
            total_volume: 2500,
            notes: 'Felt good',
            analytics: {
              radar: [{ muscle: 'Legs', volume: 2500 }],
              doughnut: [{ name: 'Legs', value: 2500, color: '#10b981' }],
            },
            exercises: [
              {
                exercise_id: 22,
                name: 'Squat',
                muscle_group: 'legs',
                sets: [
                  {
                    id: 1,
                    set_number: 1,
                    set_type: 'working',
                    weight_kg: 100,
                    reps: 5,
                    rpe: 8,
                    is_pr: false,
                  },
                ],
              },
            ],
          },
        }),
      });
    });

    await page.goto('/history/777', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Leg Day' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Set Breakdown' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Repeat/i })).toBeVisible();
  });
});


