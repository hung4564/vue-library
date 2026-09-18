# Try map packages in sibling consumer apps (local)

For apps **outside** this monorepo that consume built `@hungpvq/*` via `file:` → `dist/libs/...`.

| App | Absolute path | Guide in that repo |
|-----|---------------|--------------------|
| Vue | `g:\code\0-library\vue-3-test-map` | `TRY-LOCAL.md` |
| React | `g:\code\0-library\react-demo-map` | `TRY-LOCAL.md` |

From this monorepo root:

```bash
npm run map:build

cd ../vue-3-test-map && npm install && npm run dev
cd ../react-demo-map && npm install && npm run dev
```

Default ports: Vue Vite `5173`, React Vite `5174`.

Focused demos (hash): `/`, `/minimal`, `/draw`, `/measurement`, `/basemap`.

`file:` consumers should pin peers that npm does not always hoist from linked dist (`mitt`, turf, `proj4`, draw peers, `vue-draggable-resizable` / `react-rnd`, and for React also `vue` because `@hungpvq/shared` peers it). See each app’s `package.json` and `TRY-LOCAL.md`.

Optional Verdaccio: `npm run map:release:local` then point the app `.npmrc` at `http://localhost:4873/`.

Related: [Install from npm](./install-from-npm.md) · [Minimal starter](./minimal-starter.md) · [Peers and bundle](./peers-and-bundle.md)
