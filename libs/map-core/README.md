# Map libraries (`@hungpvq/*`)

Framework-agnostic MapLibre GIS kit with Vue and React adapters.

| Package | Description |
|---------|-------------|
| [`@hungpvq/map-core`](./core/) | Engine helpers, store, theme, locale, registry types, workers |
| [`@hungpvq/map-dataset`](./map-dataset/) | Dataset tree, builders, identify, style, GIS worker |
| [`@hungpvq/vue-map-core`](../vue/map-core/) / [`@hungpvq/react-map-core`](../react/map-core/) | Map container, controls, hooks |
| [`@hungpvq/vue-map-dataset`](../vue/map-dataset/) / [`@hungpvq/react-map-dataset`](../react/map-dataset/) | Dataset UI (+ re-exports `@hungpvq/map-dataset`) |
| [`@hungpvq/vue-map-draw`](../vue/map-draw/) | Draw / edit (**Vue only** for now) |

**Docs hub:** [core/docs/index.md](./core/docs/index.md) · **Demos:** [Vue](https://hung4564.github.io/demo-map/vue/) · [React](https://hung4564.github.io/demo-map/react/)

---

# Checklist SemVer / Breaking Change

Packages are on **`1.0.x`** — SemVer applies strictly: breaking → **major**, additive → **minor**, fix within contract → **patch**. Root barrels use **explicit named exports** (see [stable-api.md](./core/docs/core/stable-api.md)); runtime surface is locked by `public-api.spec.ts`.

## 0. Surface map (version together)

| Package | Public entries | Peer lock notes |
|---------|----------------|-----------------|
| `@hungpvq/map-core` | `.` + `./style.css` + `./worker` | maplibre `^5`, turf `^6` |
| `@hungpvq/map-dataset` | `.` + `./style.css` + `./vite` + `./assets/*` | depends on `map-core@~1.0.1` |
| `@hungpvq/vue-map-core` / `react-map-core` | `.` + `./style.css` | peer `map-core` **`~1.0.1`** |
| `@hungpvq/vue-map-dataset` / `react-map-dataset` | `.` + `./style.css` + **full re-export** of `@hungpvq/map-dataset` | peers/deps `~1.0.1` for core/dataset |
| `@hungpvq/vue-map-draw` | `.` + `./style.css` | peer `vue-map-core ~1.0.1`, `map-core ~1.0.1` |

**Monorepo rule:** bumping `@hungpvq/map-core` **minor/major** usually requires bumping adapters + dataset + draw in the same release (`~` peers allow patch-only drift). Do not publish a breaking/minor core alone.

## 1. Bump decision — quick flowchart

```
Can the change break an existing consumer (compile / runtime / CSS / registry key)?
  ├─ Yes → MAJOR (1.x → 2.0.0)
  ├─ No, only adds API / keys / themes / controls (old code still works) → MINOR
  └─ No, only bugfix / docs / perf (documented behavior unchanged) → PATCH
```

**Exception:** fixing a bug that apps already rely on (accidental public behavior) → prefer **minor** (or major if the dependency is widespread). Document it in CHANGELOG either way.

## 2. BREAKING checklist (→ major)

Any checked item must **not** ship in `1.0.x` / as a `1.x` patch.

### A. Module / package graph

- [ ] Remove or rename a package
- [ ] Change `exports` so old import paths fail (`./worker`, `./vite`, `./style.css`, `./assets/*`)
- [ ] Drop dual `import` / `require` while apps still use CJS
- [ ] Rename npm scope / package name
- [ ] Raise peer **minimum** outside the old range (e.g. `maplibre-gl` `^5` → `^6`, React 18 → 19 required, turf major mismatch across packages)
- [ ] Change optional peer → required (`tokml`, `@mapbox/shp-write`, `vite`)

### B. Named exports (TypeScript / ESM)

Treat everything listed in Stable ∪ Experimental `public-api.spec.ts` allowlists as the public runtime surface (named exports on `index.ts`).

Examples of public surface:

- **`@hungpvq/map-core`:** `MapInitializer`, `MapStoreManager`, `getMap`, `registerMapAccessor`, `UniversalRegistry`, `MapControlHandle`, `runMapControlAction`, `bootstrapMapTheme`, `MAP_THEME_*`, locale bags, services, measurement/print/legend, utils, `MAP_STORE_KEY`, errors, …
- **`@hungpvq/map-dataset`:** `IDataset`, builders (`createGeoJsonDataset`, …), `DatasetService`, `LayerSimpleMapboxBuild`, `LIST_VIEW_MENU_*`, visitors, style-control configs, …
- **Framework packages:** controls, hooks, `UniversalRegistry`, `createDatasetRegistryPlugin`, stores — and dataset UI packages **re-export all of** `@hungpvq/map-dataset`

Breaking if you:

- [ ] Remove / rename an export
- [ ] Change function/class signature incompatibly (new required params, reordered params, incompatible return)
- [ ] Narrow an exported `interface` / `type` (remove field, optional → required, remove union member)
- [ ] Change `enum` / `as const` **values** that consumers compare as strings
- [ ] Tighten generics so inference fails for previous call sites

**Safe alias (minor):** `export { Old as New }` keep `Old` `@deprecated` for ≥1 minor, remove in a later **major**.

### C. Runtime protocol (breaking even if TS still compiles)

#### Control ids (`UniversalRegistry` / `useRegisterMapControl`)

Documented ids include `mapLayerControl`, `mapThemeControl`, `mapIdentifyControl`, `mapNavigationControl`, …

- [ ] Rename a control `id`
- [ ] Change `defaultActionType` / action `type` (`mapZoomIn`, `distance`, `setScoped`, …)
- [ ] Change `MapControlHandle` shape (remove `open` / `close` / `runAction` / `actions` / `props`)
- [ ] Change semantics so `openControl` no longer matches docs (`setShow(true)`, etc.)

#### Registry component keys / menu ids

See `LIST_VIEW_MENU_COMPONENT_KEY` and `LIST_VIEW_MENU_ID` in `@hungpvq/map-dataset` (e.g. `layer-action-toggle-show`, `style-control`, `toggle-show`, `identify-layer`).

- [ ] Change string **values** of keys/ids
- [ ] Change menu click payload contract `{ layer, mapId, value, event, meta, context }`
- [ ] Change `location` union (`extra` | `menu` | `bottom` | `prebottom`)
- [ ] Remove the need for `createDatasetRegistryPlugin()` without an equivalent auto-register — UI disappearing is a **behavioral break**

#### Store / storage / event keys

- [ ] Change `MAP_STORE_KEY.*` values (`registry`, `basemap`, …)
- [ ] Change `MAP_THEME_STORAGE_KEY` (`hungpvq.map-theme-mode`)
- [ ] Change theme class names (`map-theme-light`, …) or remove a published `MAP_THEME_IDS` entry
- [ ] Change mitt / lang event name contracts

#### Dataset tree protocol

- [ ] Change `node.type` strings (`list`, `identify`, …) used by visitors/UI
- [ ] Change `dependsOn` order/semantics in `DatasetService.addDataset` / `removeDataset`
- [ ] Change default shape of `createGeoJsonDataset` if docs promise batteries-included parts

### D. CSS / theming

Documented `--map-*` tokens and `style.css` entries:

- [ ] Rename / remove a documented CSS variable
- [ ] Change stable selectors / classes apps override (`.map-theme-*`, control hooks)
- [ ] Change meaning of a documented token so custom themes break (documented token semantics → **major**; pure visual polish with same names → **minor** + note)

### E. Workers / Vite

- [ ] Change worker message protocol (`@hungpvq/map-core/worker` or GIS parse worker)
- [ ] Change `mapDatasetGisWorker()` API or required `assets` layout
- [ ] Rename worker files under `public/assets` without a migration path

### F. Component props / slots / events (Vue & React)

- [ ] Rename props (`position`, `show`, `menuContext`, …)
- [ ] Rename Vue `@map-loaded` / React equivalent callbacks
- [ ] Change slot / children contracts of `Map`, `ModuleContainer`, `LayerControl`
- [ ] Change defaults that alter documented flow (default `show`, default theme, …)

### G. Cross-package coupling

- [ ] Breaking change in `@hungpvq/map-dataset` also breaks `vue-map-dataset` / `react-map-dataset` (full re-export) — bump majors together
- [ ] Apps importing builders from `@hungpvq/vue-map-dataset` instead of `@hungpvq/map-dataset` still break when dataset breaks

## 3. NON-BREAKING → minor

- [ ] New exports (functions, components, types, **new** fields on `LIST_VIEW_MENU_*`)
- [ ] New control ids; new action types (old ones still work)
- [ ] New theme ids in `MAP_THEME_IDS` (do not remove old ones)
- [ ] New CSS variables / theme classes
- [ ] New optional props / optional peers
- [ ] Widen peer ranges when truly compatible (document)
- [ ] New subpath exports while keeping the old root barrel
- [ ] Deprecate via JSDoc `@deprecated` without removing
- [ ] New packages (e.g. React draw) that are additive

## 4. → patch

- [ ] Bugfix within documented contract
- [ ] Performance / internal logging
- [ ] Docs / demos only
- [ ] Types that more accurately describe **existing** runtime behavior — careful: stricter `.d.ts` that fail previous compiles are **major** for TypeScript consumers
- [ ] Style tweaks that do not touch documented tokens or stable class hooks

## 5. Pre-release process checklist

### Pre-merge

1. [ ] List changed **files/exports** (`src/index.ts`, barrels, `package.json#exports`)
2. [ ] Scan runtime strings: control `id:`, `LIST_VIEW_MENU_*`, `MAP_STORE_KEY`, `MAP_THEME_*`, `--map-`, worker message types
3. [ ] Diff props/events against `docs/core/module/*`
4. [ ] Confirm Vue **and** React keep the same contract
5. [ ] Peer matrix: `map-core` ↔ `map-dataset` ↔ `vue/react-*` ↔ `vue-map-draw`
6. [ ] Choose `major` | `minor` | `patch` and write one “why” line for CHANGELOG

### Release

7. [ ] Bump **together** every package pinned by exact/`~` peers
8. [ ] CHANGELOG: `BREAKING CHANGES` + migration (id/key rename tables)
9. [ ] On major: short migration guide (imports, registry keys, CSS, peers)
10. [ ] Verify Vue + React demos build on the new versions

### After release (1.x discipline)

11. [ ] Do not quietly amend contracts in patches
12. [ ] Keep `@deprecated` for ≥1 minor (or one major cycle) before removal

## 6. Common changes → suggested bump

| Change | Bump |
|--------|------|
| Add ThemeControl modes / new themes | minor |
| Change `hungpvq.map-theme-mode` or `map-theme-*` classes | major |
| Rename `mapLayerControl` / `layer-action-*` | major |
| Add `LIST_VIEW_MENU_COMPONENT_KEY.foo` | minor |
| Change menu click handler args | major |
| Add optional `LayerControl` prop | minor |
| Rename `@map-loaded` | major |
| Remove a util export from `map-core` | major |
| Internal refactor with identical API | patch |
| Raise `maplibre-gl` peer to a new major | major (unless dual-range + verified) |
| Merge UniversalRegistry host but keep facade signatures | patch/minor; if static API changes → major |
| Align Vue/React `getMethod` behavior (bugfix) | patch/minor — note if apps relied on divergence |
| Change `DatasetService` add order | major |
| Docs-only registry updates | patch |

## 7. Reducing “everything is breaking”

1. **Stable API allowlist:** [core/docs/core/stable-api.md](./core/docs/core/stable-api.md) — controls + main hooks, `createGeoJsonDataset`, `DatasetService`, `UniversalRegistry` control/component APIs, `LIST_VIEW_MENU_*`, CSS tokens, `MapControlHandle`. Runtime locks: `public-api.spec.ts` in map-core, map-dataset, vue/react map-core, vue/react map-dataset.
2. **Named root barrels** (like draggable): `src/index.ts` exports only allowlisted symbols; `src/internal-barrel.ts` holds `export *` aggregation and is **not** a package entry. First-party types via explicit `export type { … }` only — do not re-export `geojson` / `maplibre-gl` types from the root.
3. Mark non-Stable symbols **experimental** in `public-api.spec.ts` — may change in a **minor**; removing them from the root is a **major**.
4. Prefer feature subpaths later (`@hungpvq/map-core/theme`, …) only as additive minors; do not drop named root exports without a major.
5. In-family peers use `~1.0.1` (patch drift OK). Prefer widening further (e.g. `^1.0.1`) only when release process is stable and adapters stay compatible across minors.

## 8. Team policy (one line)

> **Major** if compile, registry/CSS/control/menu protocol, peer minimum, or documented behavior breaks.  
> **Minor** if additive only.  
> **Patch** if fix within the published contract.  
> Prefer the [Stable API allowlist](./core/docs/core/stable-api.md) for SemVer promises. Root exports are **named**; unlisted runtime symbols must not appear on `index.ts`. Experimental allowlisted exports may change in a minor.
