/**
 * Thin wrapper around Nx Release for map / draggable groups.
 *
 * Tag pattern comes from nx.json:
 *   release.groups.<name>.releaseTagPattern = "draggable@{version}" | "map@{version}"
 *
 * Extra steps Nx does not own:
 *   - sync SemVer markers in draggable docs
 *   - build + push GitHub Pages deploy submodule
 *
 * Flow:
 *   1) nx release version  (no git yet)
 *   2) docs sync (draggable) + site build/push
 *   3) nx release changelog + git commit/tag/push via Nx
 *   4) optional local publish (else CI on tag push)
 *
 * Usage:
 *   node scripts/release-group.js draggable
 *   node scripts/release-group.js draggable minor
 *   node scripts/release-group.js map --dry-run
 *   node scripts/release-group.js draggable --skip-site --skip-push
 *   node scripts/release-group.js draggable --local-publish --yes
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const GROUPS = {
  draggable: {
    leadPkg: 'libs/draggable/core/package.json',
    site: 'draggable',
    syncDocs: true,
  },
  map: {
    leadPkg: 'libs/map-core/core/package.json',
    site: 'map',
    syncDocs: false,
  },
};

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('-')));
  const positional = argv.filter((a) => !a.startsWith('-'));
  const group = positional[0];
  const specifier = positional[1];
  if (!group || !GROUPS[group]) {
    console.error(
      `Usage: node scripts/release-group.js <draggable|map> [specifier] [flags]`,
    );
    process.exit(1);
  }
  return {
    group,
    specifier,
    dryRun: flags.has('--dry-run') || flags.has('-d'),
    skipSite: flags.has('--skip-site'),
    skipPush: flags.has('--skip-push'),
    localPublish: flags.has('--local-publish'),
    yes: flags.has('--yes') || flags.has('-y'),
  };
}

function run(command) {
  console.log(`\n> ${command}\n`);
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
}

function runNode(script, args) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (r.status) process.exit(r.status);
}

function readVersion(relPkg) {
  return JSON.parse(fs.readFileSync(path.join(root, relPkg), 'utf8')).version;
}

function latestGroupTag(group) {
  try {
    const out = execSync(`git tag -l "${group}@*" --sort=-v:refname`, {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    return out.split(/\r?\n/).filter(Boolean)[0] || null;
  } catch {
    return null;
  }
}

function assertTagAligned(group, diskVersion) {
  const tag = latestGroupTag(group);
  if (!tag) {
    console.warn(
      `No tags matching ${group}@*. Conventional commits will fall back to disk (${diskVersion}) if no match.\n` +
        `After first real release, tags will be ${group}@${diskVersion}+.`,
    );
    return;
  }
  const tagVer = tag.slice(group.length + 1);
  const cmp = (a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  if (cmp(diskVersion, tagVer) > 0) {
    console.error(`
ERROR: package.json is ${diskVersion} but latest git tag is ${tag}.
Nx conventional-commits resolve current version from tags → would bump from ${tagVer} (wrong).

One-time fix (align tag to disk, no code change):
  git tag ${group}@${diskVersion}
  git push origin ${group}@${diskVersion}

Or dry-run with an absolute next version (skips relative bump from stale tag):
  npm run ${group}:release -- 1.2.0 --dry-run
`);
    process.exit(1);
  }
}

const opts = parseArgs(process.argv.slice(2));
const cfg = GROUPS[opts.group];
const diskVersion = readVersion(cfg.leadPkg);

console.log(`
=== release-group: ${opts.group} (Nx releaseTagPattern = ${opts.group}@{version}) ===
specifier: ${opts.specifier || '(conventional / prompt)'}
diskVersion=${diskVersion}
dryRun=${opts.dryRun} skipSite=${opts.skipSite} skipPush=${opts.skipPush} localPublish=${opts.localPublish}
`);

const isAbsoluteVersion =
  !!opts.specifier && /^\d+\.\d+\.\d+/.test(opts.specifier);
if (!isAbsoluteVersion) {
  assertTagAligned(opts.group, diskVersion);
}

// 1) Version packages only — git handled after site/docs so they land in the same commit
{
  // git defaults: nx.json release.version.git (commit/tag false, stageChanges true)
  const parts = [
    'npx',
    'nx',
    'release',
    'version',
    ...(opts.specifier ? [opts.specifier] : []),
    `--group=${opts.group}`,
  ];
  if (opts.dryRun) parts.push('--dry-run');
  run(parts.join(' '));
}

if (opts.dryRun) {
  console.log('dry-run: stop after version preview.');
  process.exit(0);
}

const version = readVersion(cfg.leadPkg);
const expectedTag = `${opts.group}@${version}`;

// 2) Docs sync (draggable markers)
if (cfg.syncDocs) {
  runNode(path.join(__dirname, 'sync-draggable-docs-version.js'), []);
}

// 3) Site build + push deploy submodule (before Nx commit so pointer can be included)
if (!opts.skipSite) {
  if (opts.skipPush) {
    run(`npm run ${cfg.site}:site:build`);
    console.log('skip-push: site built, not pushing deploy submodule.');
  } else {
    runNode(path.join(__dirname, 'push-deploy-site.js'), [
      cfg.site,
      '--version',
      version,
    ]);
  }
}

// Stage docs sync + submodule pointer (Nx stages its own version/changelog files)
{
  const extras = [];
  if (cfg.syncDocs) extras.push('libs/draggable');
  if (!opts.skipSite) extras.push(`deploy/demo-${cfg.site}`);
  if (extras.length) run(`git add -- ${extras.join(' ')}`);
}

// 4) Changelog + Nx git commit / tag / push
// git defaults: nx.json release.changelog.git + releaseTag.pattern
{
  const parts = [
    'npx',
    'nx',
    'release',
    'changelog',
    version,
    `--group=${opts.group}`,
  ];
  if (opts.skipPush) parts.push('--git-push=false');
  if (opts.skipPush) {
    console.warn(
      'Note: --skip-push sets --git-push=false. Nx rejects that when createRelease is "github" in nx.json.\n' +
        'For a full release (changelog + GitHub Release), omit --skip-push. Use --skip-site if you only want to skip the demo site.',
    );
  }
  run(parts.join(' '));
}

console.log(`\nNx should have created tag ${expectedTag} (see nx.json releaseTag.pattern).\n`);

// 5) Optional local npm publish (CI normally publishes on tag)
if (opts.localPublish) {
  const yes = opts.yes ? ' --yes' : '';
  run(`npx nx release publish --group=${opts.group}${yes}`);
}

console.log(`
Done (${opts.group}@${version}).
  expected tag: ${expectedTag}
  site: ${opts.skipSite ? 'skipped' : `deploy/demo-${cfg.site}`}
`);
