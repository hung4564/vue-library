/**
 * Build (optional) + commit/push a GitHub Pages deploy submodule.
 *
 * Usage:
 *   node scripts/push-deploy-site.js draggable --version 1.2.0
 *   node scripts/push-deploy-site.js map --version 1.0.2 --skip-build
 *   node scripts/push-deploy-site.js draggable --version 1.2.0 --dry-run
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const SITES = {
  draggable: {
    dir: 'deploy/demo-draggable',
    buildScript: 'draggable:site:build',
    remoteHint: 'https://github.com/hung4564/demo-draggable',
  },
  map: {
    dir: 'deploy/demo-map',
    buildScript: 'map:site:build',
    remoteHint: 'https://github.com/hung4564/demo-map',
  },
};

function parseArgs(argv) {
  const group = argv[0];
  if (!group || !SITES[group]) {
    console.error(
      `Usage: node scripts/push-deploy-site.js <draggable|map> --version <x.y.z> [--skip-build] [--dry-run]`,
    );
    process.exit(1);
  }
  const versionIdx = argv.indexOf('--version');
  const version =
    versionIdx >= 0 ? argv[versionIdx + 1] : undefined;
  return {
    group,
    version,
    skipBuild: argv.includes('--skip-build'),
    dryRun: argv.includes('--dry-run'),
  };
}

function run(command, cwd = root, env = {}) {
  console.log(`\n> ${command}\n`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: true,
  });
}

function git(cwd, args) {
  return execSync(`git ${args}`, {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  }).trim();
}

const { group, version, skipBuild, dryRun } = parseArgs(process.argv.slice(2));
const site = SITES[group];
const deployDir = path.join(root, site.dir);

if (!fs.existsSync(path.join(deployDir, '.git')) && !fs.existsSync(deployDir)) {
  throw new Error(`Deploy dir missing: ${site.dir}`);
}

const msgVersion = version || 'unknown';
const commitMsg = `chore: update ${group} site ${msgVersion}`;

if (!skipBuild) {
  if (dryRun) {
    console.log(`dry-run: would run npm run ${site.buildScript}`);
  } else {
    run(`npm run ${site.buildScript}`);
  }
}

if (!fs.existsSync(path.join(deployDir, '.git')) && !fs.existsSync(path.join(root, '.git', 'modules', site.dir.replace(/\\/g, '/')))) {
  // submodule gitdir file
  const gitFile = path.join(deployDir, '.git');
  if (!fs.existsSync(gitFile)) {
    throw new Error(
      `${site.dir} is not a git checkout. Init submodule first (${site.remoteHint}).`,
    );
  }
}

if (dryRun) {
  console.log(`dry-run: would commit+push ${site.dir} — "${commitMsg}"`);
  process.exit(0);
}

const status = git(deployDir, 'status --porcelain');
if (!status) {
  console.log(`No site changes in ${site.dir}; skip commit/push.`);
  process.exit(0);
}

run('git add -A', deployDir);
run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, deployDir);
run('git push origin HEAD', deployDir);

console.log(`
Pushed ${site.dir} → ${site.remoteHint}
Parent repo submodule pointer is dirty until you commit it (release-group does that).
`);
