/**
 * Build + push all GitHub Pages deploy submodules (docs, map, draggable).
 *
 * Usage:
 *   node scripts/push-all-deploy-sites.js
 *   node scripts/push-all-deploy-sites.js --version 1.2.0
 *   node scripts/push-all-deploy-sites.js --skip-build
 *   node scripts/push-all-deploy-sites.js --dry-run
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITES = ['docs', 'map', 'draggable'];

const args = process.argv.slice(2);
const versionIdx = args.indexOf('--version');
const version = versionIdx >= 0 ? args[versionIdx + 1] : undefined;
const skipBuild = args.includes('--skip-build');
const dryRun = args.includes('--dry-run');

function runSite(site) {
  const parts = [
    'node',
    path.join(__dirname, 'push-deploy-site.js'),
    site,
  ];
  if (version) parts.push('--version', version);
  if (skipBuild) parts.push('--skip-build');
  if (dryRun) parts.push('--dry-run');
  const command = parts
    .map((p) => (/\s/.test(p) ? `"${p}"` : p))
    .join(' ');
  console.log(`\n======== ${site} ========\n`);
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

for (const site of SITES) {
  runSite(site);
}

console.log(`
Done. Pushed: ${SITES.join(', ')}.
Parent repo submodule pointers may be dirty — commit them if needed:
  git add deploy/docs deploy/demo-map deploy/demo-draggable
`);
