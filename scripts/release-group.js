/**
 * Thin wrapper around Nx Release for map / draggable / shared-store groups.
 *
 * Tag pattern comes from nx.json:
 *   release.groups.<name>.releaseTagPattern
 *     = "draggable@{version}" | "map@{version}" | "shared-store@{version}"
 *
 * Extra steps Nx does not own:
 *   - sync SemVer markers in draggable docs
 *   - sync peer/deps in consumer packages (Nx skips peerDependencies)
 *   - build + push GitHub Pages deploy submodule (map / draggable only)
 *
 * Flow:
 *   1) nx release version  (no git yet)
 *   2) sync-workspace-peers (consumers → ^MAJOR.MINOR.0)
 *   3) docs sync (draggable) + site build/push (if site configured)
 *   4) nx release changelog + git commit/tag/push via Nx
 *   5) one GitHub Release for group tag (needs GH_TOKEN / GITHUB_TOKEN)
 *   6) optional local publish (else CI on tag push)
 *
 * Usage:
 *   node scripts/release-group.js draggable
 *   node scripts/release-group.js draggable minor
 *   node scripts/release-group.js map --dry-run
 *   node scripts/release-group.js shared-store patch
 *   node scripts/release-group.js draggable --skip-site --skip-push
 *   node scripts/release-group.js shared-store --local-publish --yes
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadGhToken } = require('./load-gh-token');

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
  'shared-store': {
    leadPkg: 'libs/share/store/package.json',
    site: null,
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
      `Usage: node scripts/release-group.js <draggable|map|shared-store> [specifier] [flags]`,
    );
    process.exit(1);
  }
  return {
    group,
    specifier,
    dryRun: flags.has('--dry-run') || flags.has('-d'),
    skipSite: flags.has('--skip-site') || !GROUPS[group].site,
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

/** Changelog section for `version` (e.g. `1.1.0`) from lead package CHANGELOG.md. */
function readChangelogSectionForVersion(relPkg, version) {
  const changelogPath = path.join(root, path.dirname(relPkg), 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return null;
  const text = fs.readFileSync(changelogPath, 'utf8');
  const esc = version.replace(/\./g, '\\.');
  // Prefer `## 1.1.0` / `## 1.1.0 (date)`; also allow `# 1.1.0` (Nx first release style)
  const re = new RegExp(`^#{1,2} ${esc}(?:\\s|\\(|$)`, 'm');
  const match = text.match(re);
  if (!match || match.index == null) {
    // Fallback: latest ## section
    const any = text.match(/^## .+$/m);
    if (!any || any.index == null) return null;
    const start = any.index;
    const rest = text.slice(start + any[0].length);
    const next = rest.search(/^## /m);
    return (next === -1 ? text.slice(start) : text.slice(start, start + any[0].length + next)).trim();
  }
  const start = match.index;
  const heading = match[0];
  const rest = text.slice(start + heading.length);
  const next = rest.search(/^#{1,2} /m);
  const section =
    next === -1
      ? text.slice(start)
      : text.slice(start, start + heading.length + next);
  return section.trim();
}

/** @deprecated use readChangelogSectionForVersion */
function readLatestChangelogSection(relPkg) {
  const version = readVersion(relPkg);
  return readChangelogSectionForVersion(relPkg, version);
}

function resolveGithubRepo() {
  try {
    const url = execSync('git remote get-url origin', {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/i);
    return m ? m[1].replace(/\\/g, '/') : null;
  } catch {
    return null;
  }
}

/**
 * One GitHub Release per group tag (Nx project createRelease would POST once per package).
 * Needs GH_TOKEN or GITHUB_TOKEN with `repo` / contents:write.
 */
async function createOrUpdateGroupGithubRelease(tag, body) {
  const token = loadGhToken();
  if (!token) {
    console.warn(
      `\nSkip GitHub Release (${tag}): set GH_TOKEN in .env / .env.local or env.\n` +
        `  copy .env.example → .env\n` +
        `  Or: $env:GH_TOKEN = "ghp_..."\n` +
        `Manual: https://github.com/${resolveGithubRepo() || 'OWNER/REPO'}/releases/new?tag=${encodeURIComponent(tag)}\n`,
    );
    return;
  }
  const repo = resolveGithubRepo();
  if (!repo) {
    console.warn('Skip GitHub Release: could not parse origin remote.');
    return;
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'vue-library-release-group',
  };
  const base = `https://api.github.com/repos/${repo}/releases`;
  const payload = {
    tag_name: tag,
    name: tag,
    body: body || `Release ${tag}`,
    prerelease: false,
    make_latest: 'true',
  };

  console.log(`\n> GitHub Release ${tag} (single group release)\n`);
  const existingRes = await fetch(`${base}/tags/${encodeURIComponent(tag)}`, {
    headers,
  });
  if (existingRes.status === 200) {
    const existing = await existingRes.json();
    const upd = await fetch(`${base}/${existing.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name, body: payload.body }),
    });
    if (!upd.ok) {
      throw new Error(`GitHub update release failed: ${upd.status} ${await upd.text()}`);
    }
    const data = await upd.json();
    console.log(`Updated ${data.html_url}`);
    return;
  }
  if (existingRes.status !== 404) {
    throw new Error(
      `GitHub get release failed: ${existingRes.status} ${await existingRes.text()}`,
    );
  }
  const created = await fetch(base, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!created.ok) {
    throw new Error(`GitHub create release failed: ${created.status} ${await created.text()}`);
  }
  const data = await created.json();
  console.log(`Created ${data.html_url}`);
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

async function main() {
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
    return;
  }

  const version = readVersion(cfg.leadPkg);
  const expectedTag = `${opts.group}@${version}`;

  // 2) Sync consumers' peer/deps to ^MAJOR.MINOR.0 (Nx skips peerDependencies)
  runNode(path.join(__dirname, 'sync-workspace-peers.js'), [opts.group]);

  // 3) Docs sync (draggable markers)
  if (cfg.syncDocs) {
    runNode(path.join(__dirname, 'sync-draggable-docs-version.js'), []);
  }

  // 4) Site build + push deploy submodule (before Nx commit so pointer can be included)
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

  // Stage docs sync + peer sync + submodule pointer
  {
    const extras = ['libs', 'apps'];
    if (!opts.skipSite) extras.push(`deploy/demo-${cfg.site}`);
    run(`git add -- ${extras.join(' ')}`);
  }

  // 5) Changelog + Nx git commit / tag / push
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
    run(parts.join(' '));
  }

  console.log(
    `\nNx should have created tag ${expectedTag} (see nx.json releaseTagPattern).\n`,
  );

  // 6) One GitHub Release for the group tag (body = lead CHANGELOG section)
  if (!opts.skipPush) {
    const body =
      readChangelogSectionForVersion(cfg.leadPkg, version) ||
      `Release ${expectedTag}`;
    if (!body || body === `Release ${expectedTag}`) {
      console.warn(
        `Warning: CHANGELOG section for ${version} missing/empty — release body will be minimal.`,
      );
    } else {
      console.log(
        `GitHub Release body: ${body.split(/\r?\n/).length} lines from ${path.dirname(cfg.leadPkg)}/CHANGELOG.md`,
      );
    }
    await createOrUpdateGroupGithubRelease(expectedTag, body);
  } else {
    console.warn(
      `skip-push: skipped GitHub Release for ${expectedTag}. Create manually after push.`,
    );
  }

  // 7) Optional local npm publish (CI normally publishes on tag)
  if (opts.localPublish) {
    const yes = opts.yes ? ' --yes' : '';
    run(`npx nx release publish --group=${opts.group}${yes}`);
  }

  console.log(`
Done (${opts.group}@${version}).
  expected tag: ${expectedTag}
  site: ${!cfg.site || opts.skipSite ? 'skipped' : `deploy/demo-${cfg.site}`}
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
