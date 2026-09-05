const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const deployDir = path.resolve(root, 'deploy/demo-map');

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
  console.log('Cleaned deploy/demo-map (kept .git)');
}

function writeNoJekyll() {
  fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
}

function writeDemoRedirect(name) {
  // /demo-map/vue (no trailing slash) → /demo-map/vue/
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/demo-map/${name}/" />
    <link rel="canonical" href="/demo-map/${name}/" />
    <title>Redirecting…</title>
    <script>
      location.replace('/demo-map/${name}/');
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/demo-map/${name}/">/demo-map/${name}/</a>…</p>
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

function assertDocsIndex() {
  const index = path.join(deployDir, 'index.html');
  if (!fs.existsSync(index)) {
    throw new Error(
      'Missing docs output: deploy/demo-map/index.html (check VITEPRESS_SITE=demo-map srcDir)',
    );
  }
}

cleanDeployKeepGit();

// 0) Ensure docs/pages/map/{core,dataset,draw} junctions exist
run('npm run docs:pre-link');

// 1) Map docs → deploy/demo-map/ (site root)
run('npx vitepress build docs', { VITEPRESS_SITE: 'demo-map' });
assertDocsIndex();
writeNoJekyll();

// 2) Demos into subpaths — skip nx cache (deploy dir was just cleaned)
run('npx nx run vue-demo-map:publish-demo --skip-nx-cache');
run('npx nx run react-demo-map:publish-demo --skip-nx-cache');

assertDemosPresent();
writeDemoRedirect('vue');
writeDemoRedirect('react');
writeNoJekyll();

console.log(`
Done. Output: ${deployDir}

GitHub Pages (repo hung4564/demo-map):
  /demo-map/       → docs
  /demo-map/vue/   → Vue demo
  /demo-map/react/ → React demo

Push the submodule when ready:
  cd deploy/demo-map && git add -A && git commit -m "chore: update site" && git push
`);
