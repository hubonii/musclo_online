const fs = require('fs');
const path = require('path');

// Minimal source-level contract checks per folder.
const sourceGroups = [
  { dir: 'controllers', ext: '.js', matcher: /module\.exports|exports\.[a-zA-Z]/ },
  { dir: 'routes', ext: '.js', matcher: /module\.exports|Router\(/ },
  { dir: 'services', ext: '.js', matcher: /module\.exports|exports\.[a-zA-Z]|class\s+/ },
  { dir: 'models', ext: '.js', matcher: /module\.exports|sequelize\.define/ },
  { dir: 'config', ext: '.js', matcher: /module\.exports|export\s+default/ },
];

describe('backend module source contracts', () => {
  const rootDir = path.resolve(process.cwd());

  test('source files in backend feature folders expose module contracts', () => {
    // Each file should expose something loadable (exports, router, model define, or class).
    sourceGroups.forEach((group) => {
      const target = path.join(rootDir, group.dir);
      const files = fs.readdirSync(target).filter((file) => file.endsWith(group.ext));

      files.forEach((file) => {
        const source = fs.readFileSync(path.join(target, file), 'utf8');
        expect(source).toMatch(group.matcher);
      });
    });
  });
});


