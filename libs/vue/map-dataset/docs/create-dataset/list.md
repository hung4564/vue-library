# List UI

How a dataset appears in `LayerControl`. Prefer the builder.

```ts
import {
  createDatasetPartListViewUiComponent,
  createDatasetPartListViewUiComponentBuilder,
  createMenuBuilder,
  createMenuItemToggleShow,
  createMultiLegend,
} from '@hungpvq/vue-map-dataset';
import { mdiDownload } from '@mdi/js';

// Shortcut (defaults: opacity menu, move up/down, add to group)
const simple = createDatasetPartListViewUiComponent('My Layer');
simple.color = '#ff6b6b';
simple.opacity = 0.8;

const list = createDatasetPartListViewUiComponentBuilder('My Layer')
  .setColor('#4ecdc4')
  .setOpacity(0.9)
  .setIndex(1)
  .setGroup({ id: 'g1', name: 'Group 1' })
  .setLegend(
    createMultiLegend([
      { type: 'color', value: { text: 'Fill', value: '#4ecdc4' } },
    ]),
  )
  .configInitShowLegend()
  .addMenu(createMenuItemToggleShow())
  .addMenus([
    createMenuBuilder()
      .item()
      .setLocation('menu')
      .setName('Download')
      .setIcon(mdiDownload)
      .setHidden(({ context }) => context?.role !== 'admin')
      .setClick(({ layer }) => download(layer))
      .build(),
  ])
  .build();
```

## Builder methods

| Method | Example | Effect |
| --- | --- | --- |
| `setColor` | `.setColor('#4ecdc4')` | Swatch / default paint |
| `setOpacity` | `.setOpacity(0.8)` | Initial opacity |
| `setIndex` | `.setIndex(2)` | Sort in the list |
| `setGroup` | `.setGroup('g1')` or `{ id, name }` | Initial group |
| `setLegend` | `.setLegend(createMultiLegend([...]))` | Legend block |
| `configDisabledOpacity()` | | No opacity control / no auto opacity menu |
| `configDisabledDelete()` | | Hide row delete |
| `configDisabledMove()` | | Do not add Move up/down |
| `configDisabledAddToGroup()` | | Do not add Add to group |
| `configDisabledExport()` | | Do not add Export (GeoJSON / KML / CSV / Shapefile) |
| `configInitShowLegend()` | | Legend expanded |
| `addMenu` / `addMenus` | see [Menus](./with-helper-menu.md) | Extra actions |

Each `configDisabled*(true)` is the default when called with no arg. Pass `false` to turn the flag off.

List items (`type: 'list'`) automatically get **Move up**, **Move down**, and **Add to group** unless those flags are set. Sub-items (`list-item`) do not.

**Export** is added on list and list-item when a GeoJSON source or data-management node is present. See [Export](./export.md).

## Sub-list and group list

```ts
import {
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartSubListViewUiComponentBuilder,
} from '@hungpvq/vue-map-dataset';

const group = createDatasetPartGroupSubListViewUiComponentBuilder('Group')
  .setColor('#00bfff')
  .configInitShowChildren()
  .build();

const child = createDatasetPartSubListViewUiComponentBuilder('Child')
  .setColor('#ffa500')
  .build();

group.add(child);
```

`createDatasetPartGroupSubListViewUiComponent` / `createDatasetPartSubListViewUiComponent` are the no-builder shortcuts.

## Events

The list node (not `LayerControl`) emits:

| Event | Payload |
| --- | --- |
| `toggleShow` | `{ show: boolean, dataset }` |
| `changeOpacity` | `{ opacity: number, dataset }` |

```ts
list.on('toggleShow', ({ show }) => console.log(show));
list.on('changeOpacity', ({ opacity }) => console.log(opacity));
```

See [Events](./with-helper-event.md). Legend helpers: [`createLegend` / `createMultiLegend`](../module/Legend.md).
