const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const deployDir = path.resolve(root, 'deploy/demo-draggable');

function run(command, env = {}) {
  console.log(`\n> ${command}\n`);
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: true,
  });
}

function cleanDeployKeepGit() {
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
    return;
  }
  for (const name of fs.readdirSync(deployDir)) {
    if (name === '.git') continue;
    fs.rmSync(path.join(deployDir, name), { recursive: true, force: true });
  }
  console.log('Cleaned deploy/demo-draggable (kept .git)');
}

function writeNoJekyll() {
  fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
}

function writeDemoRedirect(name) {
  // /demo-draggable/vue (no trailing slash) → /demo-draggable/vue/
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/demo-draggable/${name}/" />
    <link rel="canonical" href="/demo-draggable/${name}/" />
    <title>Redirecting…</title>
    <script>
      location.replace('/demo-draggable/${name}/');
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/demo-draggable/${name}/">/demo-draggable/${name}/</a>…</p>
  </body>
</html>
`;
  fs.writeFileSync(path.join(deployDir, `${name}.html`), html);
}

function assertDemosPresent() {
  for (const name of ['vue', 'react']) {
    const index = path.join(deployDir, name, 'index.html');
    if (!fs.existsSync(index)) {
      throw new Error(`Missing demo output: ${name}/index.html`);
    }
  }
}

cleanDeployKeepGit();

// 1) Draggable docs → deploy/demo-draggable/ (site root)
run('npx vitepress build docs', { VITEPRESS_SITE: 'demo-draggable' });
writeNoJekyll();

// 2) Demos into subpaths — skip nx cache (deploy dir was just cleaned)
run('npx nx run demo-draggable:publish-demo --skip-nx-cache');
run('npx nx run react-demo-draggable:publish-demo --skip-nx-cache');

assertDemosPresent();
writeDemoRedirect('vue');
writeDemoRedirect('react');
writeNoJekyll();

console.log(`
Done. Output: ${deployDir}

GitHub Pages (repo hung4564/demo-draggable):
  /demo-draggable/       → docs
  /demo-draggable/vue/   → Vue demo
  /demo-draggable/react/ → React demo

Push the submodule when ready:
  cd deploy/demo-draggable && git add -A && git commit -m "chore: update site" && git push
`);
