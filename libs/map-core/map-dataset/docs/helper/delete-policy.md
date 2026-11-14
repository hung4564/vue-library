# DeletePolicy

`DeletePolicy` defines how the dataset tree and its root dataset behave when a component (such as a layer or list item in `LayerControl`) is removed from the map and store.

## Type Definition

```ts
import type { DeletePolicy } from '@hungpvq/map-dataset';

export type DeletePolicy =
  | 'self'
  | 'children'
  | 'subtree'
  | 'root-on-empty'
  | 'cascade'
  | 'root';
```

## Available Policies

| Policy | Behavior | Default For | Best Used For |
| :--- | :--- | :--- | :--- |
| **`'self'`** | **Only removes itself**: Removes its own map layers (if any) and detaches itself from its parent node. Child components and the root dataset are **fully preserved**. | Standard child components (`DatasetComponent`, Table, Highlight, etc.) | When removing a specific component without affecting its children or the root dataset (underlying data sources stay in `store.datasets` for reuse). |
| **`'children'`** (or **`'subtree'`**) | **Removes itself and all its children**: Traverses the component's subtree (RTL traversal), removes all layers belonging to it and its descendants, and detaches from the parent. The **root dataset is preserved**. | Internal group / composite components | When removing a branch or group and all of its nested children, without destroying the root dataset. |
| **`'root-on-empty'`** | **Deletes the root when all components with this policy are deleted**: Removes the component and its subtree. Then checks if **any remaining components with `deletePolicy === 'root-on-empty'`** (or matching `config.deleteGroup`) exist in the root dataset. If all components of this policy are deleted, the entire root dataset is automatically cleaned up from `store.datasets` and all underlying MapLibre sources/layers are freed. Sibling components with other policies (e.g. `'self'`) do not prevent cleanup once all `'root-on-empty'` components are gone. | **Default for `list` & `list-item`** (Layer list items) | Preventing zombie data sources from remaining in memory after all visible layer items of a dataset are removed in `LayerControl`. |
| **`'cascade'`** (or **`'root'`**) | **Deleting this dataset deletes everything**: Immediately removes the entire root dataset from `store.datasets` and frees all related map sources/layers, regardless of whether sibling components still exist. | **Default for Root Datasets** | Quick and total cleanup when removing a root dataset. |

## Hierarchy & Resolution Order

When `removeComponent(component)` is invoked, `deletePolicy` is resolved in the following order:

1. **Component getter**: `component.deletePolicy` (defaults to `'root-on-empty'` for list/sublist items, `'self'` for child components, and `'cascade'` for root datasets).
2. **Component config**: `(component as any).config?.deletePolicy` (optional override).
3. **Fallback**: If the node has a parent (`component.getParent()`), defaults to `'self'`; if it has no parent (root node), defaults to `'cascade'`.

---

## Usage Examples

### Setting Directly on Datasets

```ts
import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/map-dataset';

// 1. Root datasets default to 'cascade'
const root = createRootDataset('My Dataset');
console.log(root.deletePolicy); // 'cascade'

// 2. Customize root dataset to prevent automatic removal
root.deletePolicy = 'self';

// 3. List items default to 'root-on-empty'
const listItem = createDatasetPartListViewUiComponentBuilder('Layer 1').build();
console.log(listItem.deletePolicy); // 'root-on-empty'

// 4. Change a component's policy to 'children'
const groupItem = createDatasetPartListViewUiComponentBuilder('Group A').build();
groupItem.deletePolicy = 'children'; // Removing Group A also removes all of its children
```

---

## Scoped Cleanup with `deleteGroup`

When multiple components in a dataset use `'root-on-empty'`, they by default share a single global scope: the root dataset is deleted only after **every** component with `'root-on-empty'` is removed.

However, complex datasets often contain distinct sub-features or logical collections (e.g. *primary layers* vs *analysis layers*). In such cases, you can isolate cleanup rules using `deleteGroup`.

### How It Works

1. Each component with `deletePolicy: 'root-on-empty'` can define an optional `deleteGroup` via `config.deleteGroup` (or `.configDeleteGroup('...')` on the builder).
2. When `removeComponent(component)` is called on a component belonging to a `deleteGroup`:
   - It searches for remaining components under the root dataset that match **both** `deletePolicy === 'root-on-empty'` **and** `config.deleteGroup === component.config.deleteGroup`.
   - If no other components in that specific group remain, the root dataset is automatically cleaned up and removed from `store.datasets`.
3. Components without a `deleteGroup` (i.e. `deleteGroup` is `undefined`) only count against other components where `deleteGroup` is also `undefined`.

### Example

```ts
import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/map-dataset';

const root = createRootDataset('Multi-group Dataset');

// Group 1: "main-layers"
const layer1 = createDatasetPartListViewUiComponentBuilder('Roads')
  .configDeleteGroup('main-layers')
  .build();

const layer2 = createDatasetPartListViewUiComponentBuilder('Buildings')
  .configDeleteGroup('main-layers')
  .build();

// Group 2: "extra-layers"
const layer3 = createDatasetPartListViewUiComponentBuilder('Heatmap')
  .configDeleteGroup('extra-layers')
  .build();

root.add(layer1);
root.add(layer2);
root.add(layer3);

// 1. Removing layer1: layer2 still has deleteGroup: 'main-layers' -> Root remains
api.removeComponent(layer1);

// 2. Removing layer2: layer2 was the last 'main-layers' component!
//    -> Root dataset is immediately removed from store along with all other children
api.removeComponent(layer2);
```

### Configuration Options

| Method | Syntax |
| :--- | :--- |
| **Builder API** | `.configDeleteGroup('group-name')` |
| **Direct Property** | `component.config = { ...component.config, deleteGroup: 'group-name' }` |

