const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourceRoots = ['server', 'public', 'scripts', 'tests']
  .map(name => path.join(root, name))
  .filter(dir => fs.existsSync(dir));

const ignoredDirectories = new Set(['node_modules', '.git', 'uploads', 'dist', '.cache']);

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path.join(dir, entry.name));
    }
  }
}

sourceRoots.forEach(walk);

const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    failures.push({
      file: path.relative(root, file),
      output: result.stderr || result.stdout,
    });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Syntax check failed: ${failure.file}`);
    console.error(failure.output.trim());
  }
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files.`);
