// Seed localStorage with a persisted authenticated auth-store snapshot.
export async function setAuthenticatedSession(page) {
  // Inject script before app boot so Zustand persist sees auth state at startup.
  await page.addInitScript(() => {
    window.localStorage.clear();

    const persisted = {
      state: {
        user: {
          id: 1,
          name: 'E2E User',
          email: 'e2e@example.com',
        },
        isAuthenticated: true,
      },
      version: 0,
    };

    // Uses same storage key as runtime auth store persistence config.
    window.localStorage.setItem('musclo-auth', JSON.stringify(persisted));
  });
}


