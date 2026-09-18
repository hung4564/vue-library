/**
 * Resolve GitHub token for local release scripts.
 * Order: process.env.GH_TOKEN | GITHUB_TOKEN → root `.env` / `.env.local`
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadGhToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  for (const name of ['.env.local', '.env']) {
    const file = path.join(root, name);
    const env = parseEnvFile(file);
    const token = env.GH_TOKEN || env.GITHUB_TOKEN;
    if (token) {
      process.env.GH_TOKEN = token;
      return token;
    }
  }
  return null;
}

module.exports = { loadGhToken, root };
