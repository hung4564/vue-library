# Creating a Custom Dataset Leaf

## Overview

A custom dataset leaf is a node in the dataset tree that does not have children and can store any data or logic you want. You should create a custom leaf using the provided factory functions (functional style) and by extending the returned object as needed.

## 1. Custom Type Requirement

**Custom leaves must define their own unique `type` property.**

- The `type` must not be one of the built-in types: `list`, `highlight`, `layer`, `dataManagement`, `identify`, `list-item`, `source`.
- This allows the system to distinguish your custom leaf from built-in types.

### Example:

```typescript
import { createDatasetLeaf } from '@hungpvq/vue-map-dataset';

const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type', // Must be unique
};
```

## 2. Lifecycle Hooks: addToMap and removeFromMap

If your custom leaf defines the following methods, they will be called automatically:

- `addToMap(map)`: Called when the map is initialized.
- `removeFromMap(map)`: Called when the map is destroyed.

### Example:

```typescript
const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
  addToMap(map) {
    // Custom logic to add something to the map
  },
  removeFromMap(map) {
    // Custom logic to clean up
  },
};
```

## 3. Functional Approach

You can use the factory functions to create a leaf node and extend it with your own properties or methods:

```typescript
import { createDataset, createDatasetLeaf } from '@hungpvq/vue-map-dataset';

// Option 1: createDataset (default is leaf if isComposite is not true)
const customLeaf = {
  ...createDataset('My Custom Leaf'),
  type: 'my-custom-type',
};
// Option 2: createDatasetLeaf (returns an object with type: 'leaf', override it)
const customLeaf2 = {
  ...createDatasetLeaf('Another Leaf'),
  type: 'another-custom-type',
};

parentDataset.add(customLeaf);
parentDataset.add(customLeaf2);
```

**API of the returned leaf object:**

- `getName()`, `setName(name)`
- `getParent()`, `setParent(parent)`
- `type: string` (must be unique for custom leaves)

## 4. Integration

- Add your custom leaf to any composite node (root/group) using `.add()`
- The leaf can store any data you want (object, primitive, etc.)
- Use the functional approach for all custom leaves

## 5. Example

```typescript
import { createDataset } from '@hungpvq/vue-map-dataset';

const root = createDataset('Root', null, true);
const myLeaf = {
  ...createDataset('My Custom Leaf', { custom: 123 }),
  type: 'my-custom-type',
};
root.add(myLeaf);
console.info(myLeaf.getData()); // { custom: 123 }
```

---

## Example: Using createNamedComponent

You can use `createNamedComponent` to wrap your custom leaf. This is useful for giving your component a unique identity and for advanced integration.

```typescript
import { createNamedComponent, createDatasetLeaf } from '@hungpvq/vue-map-dataset';

const baseLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
};

const customLeaf = createNamedComponent('MyCustomLeafComponent', baseLeaf);
```

---

## Example: Adding a Menu to a Custom Leaf

You can attach a menu to your custom leaf using `createWithMenuHelper`. This allows you to define custom actions for your leaf.

```typescript
import { createDatasetLeaf, createWithMenuHelper } from '@hungpvq/vue-map-dataset';

const menu = createWithMenuHelper();

const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
  menu,
};

customLeaf.menu.addMenu({
  type: 'item',
  name: 'Custom Action',
  click: () => {
    // Custom menu logic
  },
});
```

---

## Example: Adding an Event System to a Custom Leaf

You can attach an event system to your custom leaf using `createWithEventHelper`. This allows your leaf to emit and listen for custom events.

```typescript
import { createDatasetLeaf, createWithEventHelper } from '@hungpvq/vue-map-dataset';
import type { EventIListViewUI } from '@hungpvq/vue-map-dataset/src/model/list-view/types';

const event = createWithEventHelper<EventIListViewUI>();

const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
  event,
};

customLeaf.event.on('customEvent', (data) => {
  // Handle custom event
});
```

- The menu system allows you to define custom actions for your leaf (see [menu](./with-helper-menu) for more details).
- The event system allows your leaf to emit and listen for custom events (see the [event](./with-helper-event) for available events).

## When to Use a Custom Leaf

- When you need to store or manage data/state that does not fit the built-in leaf types
- When you need a simple data holder or want to add custom logic via object extension
- When you want to define custom menus or events for your leaf
