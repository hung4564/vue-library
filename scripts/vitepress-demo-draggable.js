const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const cmd = args[0] || 'dev'; // dev | build | preview
const rest = args.slice(1);

const result = spawnSync(
  'npx',
  ['vitepress', cmd, 'docs', ...rest],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITEPRESS_SITE: 'demo-draggable' },
    shell: true,
  },
);

process.exit(result.status ?? 1);
