// Source-level contract test: key frontend folders should export usable modules.
import fs from 'fs';
import path from 'path';

const sourceRoots = [
  'components',
  'pages',
  'hooks',
  'stores',
  'api',
  'lib',
  'router',
];

function walkFiles(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, exts));
      continue;
    }
    if (entry.isFile() && exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

describe('frontend module source contracts', () => {
  const rootDir = path.resolve(process.cwd(), 'src');

  test('source modules in main feature folders declare an export contract', () => {
    // This catches accidental files that define code but export nothing.
    const files = sourceRoots.flatMap((segment) =>
      walkFiles(path.join(rootDir, segment), ['.js', '.jsx'])
    );

    files.forEach((file) => {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).toMatch(/export\s+(default|const|function|\{|class)/);
    });
  });
});


