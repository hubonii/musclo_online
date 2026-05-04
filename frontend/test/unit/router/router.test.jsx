// Router source contract checks for public, protected, and fallback routes.
import fs from 'fs';
import path from 'path';

function readRouterSource() {
  const routerFile = path.resolve(__dirname, '../../../src/router/index.jsx');
  return fs.readFileSync(routerFile, 'utf8');
}

describe('router config', () => {
  test('includes public auth routes and catch-all', () => {
    const source = readRouterSource();
    expect(source).toContain("path: '/login'");
    expect(source).toContain("path: '/register'");
    expect(source).toContain("path: '/'");
    expect(source).toContain("path: '*'");
  });

  test('includes all protected app route areas', () => {
    const source = readRouterSource();
    [
      "path: 'dashboard'",
      "path: 'programs'",
      "path: 'programs/:id'",
      "path: 'programs/:programId/routines/:routineId'",
      "path: 'workout'",
      "path: 'workout/:routineId'",
      "path: 'history'",
      "path: 'history/:id'",
      "path: 'exercises'",
      "path: 'progress'",
      "path: 'profile'",
      "path: 'settings'",
    ].forEach((routeSnippet) => {
      expect(source).toContain(routeSnippet);
    });
  });
});


