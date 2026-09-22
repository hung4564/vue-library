/**
 * Create/update one GitHub Release for an existing group tag (backfill notes).
 *
 * Usage:
 *   node scripts/create-group-github-release.js draggable@1.3.1
 *   node scripts/create-group-github-release.js map@1.1.0
 *   node scripts/create-group-github-release.js shared-store@0.3.0
 *   node scripts/create-group-github-release.js shared-log@0.2.0
 *
 * Needs GH_TOKEN or GITHUB_TOKEN (env or root `.env` / `.env.local`).
 * Body is taken from the lead package CHANGELOG.md section for that version.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadGhToken, root } = require('./load-gh-token');

const LEAD = {
  draggable: 'libs/draggable/core/package.json',
  map: 'libs/map-core/core/package.json',
  'shared-store': 'libs/share/store/package.json',
  'shared-log': 'libs/share/log/package.json',
};

function resolveGithubRepo() {
  const url = execSync('git remote get-url origin', {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/i);
  if (!m) throw new Error('Could not parse origin remote');
  return m[1].replace(/\\/g, '/');
}

function readChangelogSectionForVersion(relPkg, version) {
  const changelogPath = path.join(root, path.dirname(relPkg), 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return null;
  const text = fs.readFileSync(changelogPath, 'utf8');
  const esc = version.replace(/\./g, '\\.');
  const re = new RegExp(`^#{1,2} ${esc}(?:\\s|\\(|$)`, 'm');
  const match = text.match(re);
  if (!match || match.index == null) return null;
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

async function main() {
  const tag = process.argv[2];
  if (!tag || !tag.includes('@')) {
    console.error(
      'Usage: node scripts/create-group-github-release.js <group>@<version>',
    );
    process.exit(1);
  }
  const at = tag.lastIndexOf('@');
  const group = tag.slice(0, at);
  const version = tag.slice(at + 1);
  const lead = LEAD[group];
  if (!lead) {
    console.error(
      `Unknown group "${group}". Expected: ${Object.keys(LEAD).join(', ')}`,
    );
    process.exit(1);
  }

  const token = loadGhToken();
  if (!token) {
    console.error(
      'Set GH_TOKEN (or GITHUB_TOKEN).\n' +
        '  File: copy .env.example → .env and set GH_TOKEN=ghp_...\n' +
        '  Or:  $env:GH_TOKEN = "ghp_..."',
    );
    process.exit(1);
  }

  const body =
    readChangelogSectionForVersion(lead, version) || `Release ${tag}`;
  if (!readChangelogSectionForVersion(lead, version)) {
    console.warn(
      `No CHANGELOG section for ${version} in ${path.dirname(lead)}/CHANGELOG.md`,
    );
  } else {
    console.log(`Using CHANGELOG section (${body.split(/\r?\n/).length} lines)`);
  }

  const repo = resolveGithubRepo();
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'vue-library-create-group-github-release',
    'Content-Type': 'application/json',
  };
  const base = `https://api.github.com/repos/${repo}/releases`;
  const payload = {
    tag_name: tag,
    name: tag,
    body,
    prerelease: false,
    make_latest: 'true',
  };

  const existingRes = await fetch(`${base}/tags/${encodeURIComponent(tag)}`, {
    headers,
  });
  if (existingRes.status === 200) {
    const existing = await existingRes.json();
    const upd = await fetch(`${base}/${existing.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        name: payload.name,
        body: payload.body,
        make_latest: 'true',
      }),
    });
    if (!upd.ok) throw new Error(`${upd.status} ${await upd.text()}`);
    console.log(`Updated ${(await upd.json()).html_url}`);
    return;
  }
  if (existingRes.status !== 404) {
    throw new Error(`${existingRes.status} ${await existingRes.text()}`);
  }
  const created = await fetch(base, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!created.ok) throw new Error(`${created.status} ${await created.text()}`);
  console.log(`Created ${(await created.json()).html_url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
