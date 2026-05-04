// Common API mocks shared by multiple Playwright flows.
export async function mockAuthenticatedUser(page) {
  // Intercepts auth profile request and returns deterministic user payload.
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

export async function mockSharedBootstrap(page) {
  // Mock startup endpoints used by dashboard/history/progress routes.
  await page.route('**/api/settings*', async (route) => {
    if (route.request().method() === 'GET') {
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

    await route.fallback();
  });

  // Return empty datasets for dashboard boot queries to keep tests deterministic.
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
          workouts: { total: 0, this_week: 0 },
          volume: { total_kg: 0 },
          time: { total_seconds: 0 },
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


