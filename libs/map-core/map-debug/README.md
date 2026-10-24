# `@hungpvq/map-debug`

Experimental **dataset** debug toolkit. Generic Store / Live / Logs / Errors live in `@hungpvq/shared-log`.

- **Root** (`@hungpvq/map-debug`): `DEVTOOLS_CONTROL`, install flag, map-scoped store peek. No `map-dataset` dependency.
- **`./dataset`**: Dataset Inspector + pin on shared-store `map:debug.dataset` (F12 alias `window.__hungpvqDatasetDebug`). Requires peer `@hungpvq/map-dataset`.

```ts
import { installDatasetDebug } from '@hungpvq/map-debug/dataset';

installDatasetDebug(); // only when map-dataset is installed
```

Prefer `installDevtools()` from `@hungpvq/vue-map-devtools` / `@hungpvq/react-map-devtools` — it installs shared-log debug + the dataset bridge and pin-registers the Dataset tab. Devtools UI mounts as a **map control popup** (`DraggableItemPopup`), not a floating overlay.

`map:debug` holds the dataset pin and `installed` flag only. Log persistence is `log:debug` on `@hungpvq/shared-log`.

## Devtools Dataset panes

Framework adapters register a **Dataset** tab on `globalThis.__hungpvqDebug`:

| Pane        | Purpose                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| **Roots**   | Pin / open a dataset from the map store tree                              |
| **Inspect** | Hierarchy, fields, children; find-by-type helpers                         |
| **Menus**   | Resolved menus by placement (`title` / `extra` / `menu` / …) + raw detail |

Dataset CSS (`.dataset-viewer*`) lives in `@hungpvq/map-debug` (`style.css`). Generic chrome is `@hungpvq/shared-log/style.css`. See [Map Devtools](../core/docs/core/devtools.md).

### Anonymous menu ids

Menus without a real `menu.id` get a **debug-only** key via `menuDebugKey`:

```text
anon:<type>-<name>-…:<resolvedIndex>
```

- Shown in the Menus list with `idGenerated: true` (chip `generated`).
- Does **not** mutate the live `MenuAction`.
- Selection uses `MenuSummary` / `findMenuInResolved` (by real id, then `anon:…:index`, then fingerprint key). Prefer selecting by summary object from the UI rather than a bare id string.

Console helpers after `installDatasetDebug()` — prefer F12 `window.__hungpvqDatasetDebug` (same object as `map:debug.dataset`):

| Method                             | Notes                                           |
| ---------------------------------- | ----------------------------------------------- |
| `previewMenus(opts?)`              | Partitioned summaries for current session       |
| `inspectMenu(menuId)`              | Detail for one resolved menu                    |
| `explainMenus` / `explainFindPart` | Step traces for console (not shown in panel UI) |
| `help()`                           | Method cheat sheet                              |

## Menu: Debug dataset

`installDatasetDebug` registers `createMenuItemDebugDataset` as a **global default** on every dataset:

| Host           | Default location                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `for: 'layer'` | `title` (LayerDetail / AttributeTable header); `menu` on layer-control / identify / attribute-table rows |
| `for: 'item'`  | `menu`                                                                                                   |

Hidden unless `isMapDevtoolsInstalled()` (set by framework `installDevtools`). Click opens tab `dataset` via `openDebugTab('dataset')`.

```ts
import { createMenuItemDebugDataset } from '@hungpvq/map-debug/dataset';

// Manual override only — normally auto-registered:
.createMenuItemDebugDataset({ target: 'layer' })
```

After click: `vars.dataset`, `vars.value`, `vars.host`, and `session` (`mapId`, `datasetId`, `control`, `target`).
