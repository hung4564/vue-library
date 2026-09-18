/**
 * Smoke: verify map package dist outputs exist and declare expected exports.
 * Run after `npm run map:build` (or include build via npm script).
 * Does not publish to npm.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distRoot = path.join(root, 'dist', 'libs');

const required = [
  {
    pkg: '@hungpvq/map-core',
    dir: path.join(distRoot, 'map-core', 'core'),
    exports: ['.', './style.css'],
  },
  {
    pkg: '@hungpvq/map-dataset',
    dir: path.join(distRoot, 'map-core', 'map-dataset'),
    exports: ['.', './style.css'],
  },
  {
    pkg: '@hungpvq/vue-map',
    dir: path.join(distRoot, 'vue', 'map'),
    exports: ['.', './style.css'],
  },
  {
    pkg: '@hungpvq/react-map',
    dir: path.join(distRoot, 'react', 'map'),
    exports: ['.', './style.css'],
  },
  {
    pkg: '@hungpvq/vue-map-core',
    dir: path.join(distRoot, 'vue', 'map-core'),
    exports: ['.', './style.css', './fields'],
  },
  {
    pkg: '@hungpvq/react-map-core',
    dir: path.join(distRoot, 'react', 'map-core'),
    exports: ['.', './style.css', './fields'],
  },
];

let fail = 0;
for (const entry of required) {
  const pkgPath = path.join(entry.dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(`MISSING ${pkgPath}`);
    fail = 1;
    continue;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.name !== entry.pkg) {
    console.error(`NAME mismatch ${pkgPath}: expected ${entry.pkg}, got ${pkg.name}`);
    fail = 1;
  }
  const exportMap = pkg.exports || {};
  for (const key of entry.exports) {
    const has =
      key === '.'
        ? exportMap['.'] || exportMap['./index.js'] || pkg.main || pkg.module
        : exportMap[key];
    if (!has) {
      console.error(`MISSING export ${key} in ${entry.pkg}`);
      fail = 1;
    }
  }
  const indexJs = path.join(entry.dir, 'index.js');
  const indexMjs = path.join(entry.dir, 'index.mjs');
  const indexCjs = path.join(entry.dir, 'index.cjs');
  if (!fs.existsSync(indexJs) && !fs.existsSync(indexMjs) && !fs.existsSync(indexCjs)) {
    console.error(`MISSING entry file under ${entry.dir}`);
    fail = 1;
  } else {
    console.log(`OK ${pkg.name}@${pkg.version}`);
  }
}

process.exit(fail);
