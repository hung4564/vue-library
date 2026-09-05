const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Order matters: nested junctions first, then the map root.
const links = [
  {
    source: path.resolve(__dirname, '../libs/map-core/map-dataset/docs'),
    target: path.resolve(__dirname, '../libs/map-core/core/docs/dataset'),
  },
  {
    source: path.resolve(__dirname, '../libs/map-core/core/docs'),
    target: path.resolve(__dirname, '../docs/pages/map'),
  },
  {
    source: path.resolve(__dirname, '../libs/draggable/core/docs'),
    target: path.resolve(__dirname, '../docs/pages/draggable'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/shared/src'),
    target: path.resolve(__dirname, '../docs/pages/share/shared'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/core/src'),
    target: path.resolve(__dirname, '../docs/pages/share/core'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/file/src'),
    target: path.resolve(__dirname, '../docs/pages/share/file'),
  },
];

function removeStaleTarget(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.lstatSync(target);
  // Prefer rmdir so Windows junctions are detached without deleting source contents
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    try {
      fs.rmdirSync(target);
    } catch {
      if (process.platform === 'win32') {
        execSync(`cmd /c rmdir "${target}"`, { stdio: 'inherit' });
      } else {
        fs.rmSync(target, { recursive: true, force: true });
      }
    }
    console.log('Removed stale path:', target);
    return;
  }
  fs.unlinkSync(target);
  console.log('Removed stale file:', target);
}

function pointsToSource(target, source) {
  try {
    const linked = fs.readlinkSync(target);
    const resolved = path.isAbsolute(linked)
      ? linked
      : path.resolve(path.dirname(target), linked);
    return path.resolve(resolved) === path.resolve(source);
  } catch {
    return false;
  }
}

links.forEach(({ source, target }) => {
  if (!fs.existsSync(source)) {
    console.error('Missing source (skip):', source);
    return;
  }

  const parent = path.dirname(target);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }

  if (fs.existsSync(target)) {
    if (pointsToSource(target, source)) {
      console.log('Symlink already exists:', target);
      return;
    }
    removeStaleTarget(target);
  }

  fs.symlinkSync(source, target, 'junction');
  console.log('Symlink created:', target, '->', source);
});
