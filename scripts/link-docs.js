const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Order: core map docs → docs/pages/map, then dataset nested under that tree.
// Because pages/map junctions to map-core/docs, pages/map/dataset appears as
// map-core/docs/dataset (gitignore'd junction → map-dataset/docs).
const links = [
  {
    source: path.resolve(__dirname, '../libs/map-core/docs'),
    target: path.resolve(__dirname, '../docs/pages/map'),
  },
  {
    source: path.resolve(__dirname, '../libs/map-dataset/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/dataset'),
  },
  {
    source: path.resolve(__dirname, '../libs/map-draw/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/draw'),
  },
  {
    source: path.resolve(__dirname, '../libs/draggable/docs'),
    target: path.resolve(__dirname, '../docs/pages/draggable'),
  },
  {
    source: path.resolve(__dirname, '../libs/shared-log/docs'),
    target: path.resolve(__dirname, '../docs/pages/shared-log'),
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

function targetEntryExists(target) {
  try {
    fs.lstatSync(target);
    return true;
  } catch {
    return false;
  }
}

function removeStaleTarget(target) {
  if (!targetEntryExists(target)) return;
  let stat;
  try {
    stat = fs.lstatSync(target);
  } catch {
    return;
  }
  // Prefer rmdir so Windows junctions are detached without deleting source contents.
  // Real (non-junction) directories use recursive delete.
  if (stat.isSymbolicLink()) {
    try {
      fs.rmdirSync(target);
    } catch {
      fs.unlinkSync(target);
    }
    console.log('Removed stale path:', target);
    return;
  }
  if (stat.isDirectory()) {
    try {
      fs.readlinkSync(target);
      if (process.platform === 'win32') {
        execSync(`cmd /c rmdir "${target}"`, { stdio: 'inherit' });
      } else {
        fs.rmdirSync(target);
      }
    } catch {
      fs.rmSync(target, { recursive: true, force: true });
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

// Drop legacy nested copy/junction under map-core docs (SoT is package docs/).
removeStaleTarget(path.resolve(__dirname, '../libs/map-core/docs/dataset'));
removeStaleTarget(path.resolve(__dirname, '../libs/map-core/docs/draw'));
removeStaleTarget(
  path.resolve(__dirname, '../libs/map-core/core/docs/dataset'),
);
removeStaleTarget(path.resolve(__dirname, '../libs/map-core/core/docs/draw'));

links.forEach(({ source, target }) => {
  if (!fs.existsSync(source)) {
    console.error('Missing source (skip):', source);
    return;
  }

  const parent = path.dirname(target);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }

  if (targetEntryExists(target)) {
    if (pointsToSource(target, source)) {
      console.log('Symlink already exists:', target);
      return;
    }
    removeStaleTarget(target);
  }

  fs.symlinkSync(source, target, 'junction');
  console.log('Symlink created:', target, '->', source);
});
