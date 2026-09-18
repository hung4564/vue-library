/**
 * Smoke: verify map package dist outputs exist and declare expected exports.
 * Run after `npm run map:build` (or include build via npm script).
 * Does not publish to npm.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distRoot = path.join(root, 'dist', 'libs');

/** Source package.json under libs/ — used to decide if ./style.css is expected. */
const sourcePkg = {
  '@hungpvq/map-draw': path.join(root, 'libs', 'map-core', 'map-draw', 'package.json'),
  '@hungpvq/vue-map-draw': path.join(root, 'libs', 'vue', 'map-draw', 'package.json'),
  '@hungpvq/react-map-draw': path.join(root, 'libs', 'react', 'map-draw', 'package.json'),
  '@hungpvq/vue-map-dataset': path.join(root, 'libs', 'vue', 'map-dataset', 'package.json'),
  '@hungpvq/react-map-dataset': path.join(root, 'libs', 'react', 'map-dataset', 'package.json'),
};

function sourceDeclaresStyleCss(pkgName) {
  const srcPath = sourcePkg[pkgName];
  if (!srcPath || !fs.existsSync(srcPath)) return false;
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  return !!(src.exports && src.exports['./style.css']);
}

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
    pkg: '@hungpvq/map-draw',
    dir: path.join(distRoot, 'map-core', 'map-draw'),
    exports: ['.'],
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
  {
    pkg: '@hungpvq/vue-map-draw',
    dir: path.join(distRoot, 'vue', 'map-draw'),
    exports: ['.'],
  },
  {
    pkg: '@hungpvq/react-map-draw',
    dir: path.join(distRoot, 'react', 'map-draw'),
    exports: ['.'],
  },
  {
    pkg: '@hungpvq/vue-map-dataset',
    dir: path.join(distRoot, 'vue', 'map-dataset'),
    exports: ['.'],
  },
  {
    pkg: '@hungpvq/react-map-dataset',
    dir: path.join(distRoot, 'react', 'map-dataset'),
    exports: ['.'],
  },
];

// Append ./style.css to expected exports when source package.json declares it
for (const entry of required) {
  if (sourceDeclaresStyleCss(entry.pkg) && !entry.exports.includes('./style.css')) {
    entry.exports.push('./style.css');
  }
}

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
  // Assert style.css file exists on disk when export present
  if (exportMap['./style.css'] || entry.exports.includes('./style.css')) {
    const stylePath = path.join(entry.dir, 'style.css');
    if (!fs.existsSync(stylePath)) {
      console.error(`MISSING style.css file for ${entry.pkg} at ${stylePath}`);
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
