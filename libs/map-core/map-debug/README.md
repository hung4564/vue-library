# `@hungpvq/map-debug`

Experimental shared debug toolkit for map packages.

- **Root** (`@hungpvq/map-debug`): viewer helpers + store peek. No `map-dataset` dependency.
- **`./dataset`**: optional Dataset Inspector + `window.__hungpvqDatasetDebug`. Requires peer `@hungpvq/map-dataset`.

```ts
import { installMapDebug } from '@hungpvq/map-debug';
import { installDatasetDebug } from '@hungpvq/map-debug/dataset';

installMapDebug();
installDatasetDebug(); // only when map-dataset is installed
```

Prefer `installDevtools()` from `@hungpvq/vue-map-devtools` / `@hungpvq/react-map-devtools` — it installs map-debug + dataset bridge together.

## Devtools Dataset panes

Framework adapters render a **Dataset** tab on top of this package:

| Pane | Purpose |
| --- | --- |
| **Roots** | Pin / open a dataset from the map store tree |
| **Inspect** | Hierarchy, fields, children; find-by-type helpers |
| **Menus** | Resolved menus by placement (`title` / `extra` / `menu` / …) + raw detail |

Shared CSS lives in `@hungpvq/map-debug` (`style.css`) and is imported by both Vue and React map-devtools packages.

### Anonymous menu ids

Menus without a real `menu.id` get a **debug-only** key via `menuDebugKey`:

```text
anon:<type>-<name>-…:<resolvedIndex>
```

- Shown in the Menus list with `idGenerated: true` (chip `generated`).
- Does **not** mutate the live `MenuAction`.
- Selection uses `MenuSummary` / `findMenuInResolved` (by real id, then `anon:…:index`, then fingerprint key). Prefer selecting by summary object from the UI rather than a bare id string.

Console helpers on `window.__hungpvqDatasetDebug` after `installDatasetDebug()`:

| Method | Notes |
| --- | --- |
| `previewMenus(opts?)` | Partitioned summaries for current session |
| `inspectMenu(menuId)` | Detail for one resolved menu |
| `explainMenus` / `explainFindPart` | Step traces for console (not shown in panel UI) |
| `help()` | Method cheat sheet |

## Menu: Debug dataset

`installDatasetDebug` registers `createMenuItemDebugDataset` as a **global default** on every dataset:

| Host | Default location |
| --- | --- |
| `for: 'layer'` | `title` (LayerDetail / AttributeTable header); `menu` on layer-control / identify / attribute-table rows |
| `for: 'item'` | `menu` |

Hidden unless `isMapDevtoolsInstalled()` (set by `installDevtoolsCore` / framework `installDevtools`).

```ts
import { createMenuItemDebugDataset } from '@hungpvq/map-debug/dataset';

// Manual override only — normally auto-registered:
.createMenuItemDebugDataset({ target: 'layer' })
```

After click: `vars.dataset`, `vars.value`, `vars.host`, and `session` (`mapId`, `datasetId`, `control`, `target`).
