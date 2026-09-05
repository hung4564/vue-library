# Creating a Custom Dataset Leaf

A leaf is a node without children. Built-in types (`list`, `layer`, `source`, `identify`, `highlight`, `dataManagement`, `list-item`) are reserved — pick another `type`.

```typescript
import { createRootDataset, createDatasetLeaf } from '@hungpvq/vue-map-dataset';

const root = createRootDataset('Root');
const leaf = {
  ...createDatasetLeaf('My leaf'),
  type: 'my-custom-type',
  addToMap(map) {
    // optional
  },
  removeFromMap(map) {
    // optional
  },
};
root.add(leaf);
```

`addToMap` / `removeFromMap` run when the dataset is added to or removed from the map.

Menus and events (same helpers as list UI):

```typescript
import {
  createDatasetLeaf,
  createWithMenuHelper,
  createWithEventHelper,
  createMenuBuilder,
} from '@hungpvq/vue-map-dataset';

const menu = createWithMenuHelper();
const event = createWithEventHelper();

menu.addMenu(
  createMenuBuilder()
    .item()
    .setLocation('menu')
    .setName('Custom')
    .setClick(({ layer }) => {
      event.emit('customEvent', layer);
    })
    .build(),
);

const leaf = {
  ...createDatasetLeaf('My leaf'),
  type: 'my-custom-type',
  ...menu,
  ...event,
};
```

See [Menus](./with-helper-menu.md) and [Events](./with-helper-event.md).
