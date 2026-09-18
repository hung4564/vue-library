# Attribute table

Import the full API from `@hungpvq/map-dataset/attribute-table`.

Tabular view of GeoJSON feature properties. The **Attribute table** item is **not** auto-added by the list UI builder. Attach it with `list.addMenu(createMenuItemAttributeTable())`, or use [`createGeoJsonDataset`](../helper/QuickDatasetCreation.md). It hides when the layer has no GeoJSON source / data-management sibling.

**Architecture:** Vue/React shells only call `createAttributeTableController`. Data + selection resolve both go through **`AttributeTableStore.list`** with an explicit `intent`:

| Intent | When | Cache hint |
|--------|------|------------|
| `'page'` | Browse / page / search / sort | page + search + sort |
| `'select'` | Highlight selection missing on current page | sorted `ids` (separate from page cache) |

Default store: DM sibling → wrap `part.list`; else local GeoJSON; or inject `store`.

Select rows to highlight. **Zoom to selection** is off by default.

**Export** lives in [`@hungpvq/map-dataset/geo-export`](./export.md). The Attribute Table toolbar **Export** button (`ui.export`, default `true`) opens the same controller / `onExport` / scopes. While the table is open, filtered/selected export reuses the AT store via the geo-export active-source bridge.

Needs `installMapApp` (or `createDatasetRegistryPlugin`) and `ComponentManagementControl`. Row selection paints via the highlight controller (`source: 'attribute-table'`); clear with `hideIfSource('attribute-table')`. Import parts / controller from `@hungpvq/map-dataset/highlight` — no `LayerHighlight` mount.

## Built-in menu

```ts
import { createMenuItemAttributeTable } from '@hungpvq/map-dataset/attribute-table';

createDatasetPartListViewUiComponentBuilder('Cities')
  .setColor('#ff6b6b')
  .addMenu(createMenuItemAttributeTable())
  .build();
```

Hide at render time: `menuContext: { disabledAttributeTable: true }`. With `createGeoJsonDataset`, skip the menu via `attributeTable: false`. Or omit `addMenu` / call `removeMenu(LIST_VIEW_MENU_ID.layer.attributeTable)`.

## Columns + `ui` + custom store

Column / UI defs resolve in this order (later wins):

1. **Auto** — property keys from the FeatureCollection (columns only)
2. **`createMenuItemAttributeTable({ columns, ui })`** / shell props
3. **Dataset part** — `createDatasetPartAttributeTable({ columns, ui })` (highest)

```ts
import {
  createDatasetPartAttributeTable,
  createMenuItemAttributeTable,
  createLocalAttributeTableStore,
} from '@hungpvq/map-dataset/attribute-table';

// Highest priority: attach next to list / source / data-management
dataset.add(
  createDatasetPartAttributeTable('table', {
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'id', label: 'ID', sortable: false },
      '__geometry',
    ],
    ui: { sort: true },
  }),
);

list.addMenu(
  createMenuItemAttributeTable({
    columns: [
      {
        key: 'name',
        label: 'Name',
        format: (v) => String(v ?? '').toUpperCase(),
      },
      { key: 'pop', label: 'Population', sortable: false },
      {
        key: 'status',
        label: 'Status',
        // string = Registry componentKey; or pass a Vue/React component
        cellComponent: 'my-status-cell',
        headerComponent: 'my-status-header',
      },
      '__geometry',
    ],
    ui: {
      search: true,
      pager: true,
      checkbox: true,
      sort: true, // false → disable all column sorting
    },
    // optional: store: createLocalAttributeTableStore(fc),
  }),
);
```

**Custom `store`:** when you inject `store` on the menu / shell / controller, dataset-part **columns are not applied** — the store owns its column layout. Part `ui` still wins over menu/shell via `resolveAttributeTableUiOption`.

Column options:

| Field | Role |
| --- | --- |
| `format` | `(value, ctx) => string` — builds `row.cells[key]` (framework-agnostic) |
| `sortable` | Default `true`; `false` disables header sort for that column |
| `cellComponent` | Registry `componentKey` (`string`) **or** Vue/React component |
| `headerComponent` | Registry `componentKey` (`string`) **or** Vue/React component |

Custom cell props: `{ value, raw, row, column }` (`AttributeTableCellProps`).  
Custom header props: `{ label, column, sortable, sortDir?, sortOrder?, sortCount?, onSort? }` (`AttributeTableHeaderProps`).  
When `sortable`, call `onSort(append?)` from the header UI (Shift → multi-sort). Default (non-custom) headers still sort via `<th>` click.  
Sort cycle per column: **none → asc → desc → none**.

`ui` flags only show/hide built-ins (`sort` toggles sorting). **Do not** pass a top-level `components` prop — override chrome via Registry (below). Per-column cells/headers use `cellComponent` / `headerComponent` (string key → `UniversalRegistry.registerComponentForMap`).

## Store API

```ts
import {
  createAttributeTableStoreFromDataset,
  createLocalAttributeTableStore,
  type AttributeTableStore,
} from '@hungpvq/map-dataset/attribute-table';

// Default: DM → part.list; else local GeoJSON
const store = createAttributeTableStoreFromDataset(list);

await store.list({ intent: 'page', page: 1, pageSize: 50, search: 'ha' });
await store.list({ intent: 'select', ids: ['1', '2'], pageSize: 'all' });
```

Custom store — always branch on `intent` (do not infer from `ids` alone):

```ts
const store: AttributeTableStore = {
  async list(query) {
    if (query.intent === 'select') {
      // fetch / filter by query.ids — cache separately
    }
    // page browse
  },
  // optional: invalidate() { /* drop your caches */ },
};
```

**Freshness:** DM-backed stores call `part.list` every time (no row cache). Local stores from an `IDataset` re-read GeoJSON on each non-quiet `controller.load` / `list`. A static `FeatureCollection` seed is cached until `store.invalidate()` (also called by the controller on reload / page-change / initial load).

DM select convention: wrapper maps `ids` → `PageQuery.filter.ids` (LocalStore honors it).

## Controller (headless)

```ts
import { createAttributeTableController } from '@hungpvq/map-dataset/attribute-table';

const controller = createAttributeTableController(list, {
  columns: [{ key: 'name', label: 'Name' }],
  // store: customStore,
});
await controller.load('initial');
controller.subscribe(() => { /* re-render from controller.getState() */ });
await controller.resolveFeaturesForSelection(['1']); // intent: 'select' if needed
controller.dispose();
```

## Override parts via UniversalRegistry

Prefer Registry for component swaps. Props are for data / toggles (`columns`, `store`, `ui`).

| Key | Props type |
| --- | --- |
| `attribute-table` / `root` | `AttributeTableProps` |
| `attribute-table-view` / `view` | `AttributeTableViewProps` — full body |
| `attribute-table-toolbar` / `toolbar` | `AttributeTableToolbarProps` |
| `attribute-table-grid` / `grid` | `AttributeTableGridProps` |
| `attribute-table-pager` / `pager` | `AttributeTablePagerProps` |

```ts
import { ATTRIBUTE_TABLE_COMPONENT_KEY } from '@hungpvq/map-dataset/attribute-table';
import type { AttributeTableViewProps } from '@hungpvq/map-dataset/attribute-table';
import { UniversalRegistry } from '@hungpvq/vue-map-core';

function CustomTable(props: AttributeTableViewProps) {
  const { rows, columns, loading } = props.controller.getState();
  // props.controller.goNext() · props.controller.selectIds(…)
}

UniversalRegistry.registerComponentForMap(
  mapId,
  ATTRIBUTE_TABLE_COMPONENT_KEY.view,
  CustomTable,
);
```

Demo `/#/dataset-attribute-table`: registry overrides, `addComponent` (+ columns / ui / cell+header components), custom store via `store.list`, `queueAttributeTableSelectRows`, `runMapControlAction`.

## Accessibility

Panel chrome (dialog role, Escape, focus trap/restore, titled close) is owned by the **popup shell**. AttributeTable only owns the **content** contract below.

### Roles and live regions

| Surface | Contract |
|---------|----------|
| Selection / total | Polite `role="status"` live region (`selectionStatus` locale template with `{selected}` / `{total}`) |
| Grid body | `role="region"` + `aria-label` (`gridRegion`); loading uses `aria-busy` |
| Loading / empty | `role="status"` + `aria-live="polite"` |
| Table | Native `<table>` + `aria-label` (layer name or `table` locale) |
| Column headers | `scope="col"`; sortable headers expose `aria-sort` |
| Sort control | `<button type="button">` inside `<th>` (keyboard + screen reader); Shift+click / Shift+Enter keeps multi-sort |
| Rows | `aria-selected`; named row / select-all checkboxes |
| Pager page text | `role="status"` + `aria-live="polite"` |
| Search / row filter | Explicit `aria-label` (not placeholder-only) |

Do **not** use `role="grid"` unless you intentionally adopt ARIA grid keyboard semantics. Custom header/cell registry slots should remain keyboard-activatable; the default path is accessible without overrides.

### Keyboard (content)

| Key | When focus is in the table region / focused row |
|-----|--------------------------------------------------|
| ArrowUp / ArrowDown | Move roving focus among **visible** (virtualized) rows |
| Home / End | First / last visible row |
| Space / Enter | Toggle selection on the focused row (ignored when target is a button, checkbox, link, or input) |
| Tab | Moves through dialog chrome and focusable controls (sort buttons, checkboxes, pager); does not replace the shell Tab trap |
| Escape | Closes the panel via the draggable shell when focus is inside it |

### Locale keys (`map.attribute-table.*`)

A11y-oriented keys: `table`, `gridRegion`, `selectAll`, `selectRow`, `actionsColumn`, `rowFilter`, `sortedAsc`, `sortedDesc`, `notSorted`, `selectionStatus` (plus existing `search`, `loading`, `empty`, pager labels, …). Helper: `formatAttributeTableSelectionStatus(template, selected, total)`.
