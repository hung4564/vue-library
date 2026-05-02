---
outline: [2, 3]
---

# Dataset Overview

## Introduction

The Dataset system is a core concept of this library, providing a flexible and extensible way to manage map data, layers, sources, UI controls, and related behaviors. A Dataset is a tree structure, starting from a root dataset, with various child nodes representing different functionalities.

## Getting Started

Begin by creating a root dataset:

```typescript
const dataset = createRootDataset('Root Dataset');
```

This root serves as the entry point for your dataset tree. You can attach group or leaf datasets to this root.

### Adding Groups and Leaves

To add a group (for organizing child datasets):

```typescript
const datasetGroup = createGroupDataset('Group Dataset');
dataset.add(datasetGroup);
```

To add a leaf dataset:

```typescript
const datasetLeaf = createDataset('Leaf Dataset');
dataset.add(datasetLeaf);
```

## Defining Dataset Dependency with `dependsOn`

You can explicitly specify the dependency relationship between datasets using the `dependsOn` property. This property should be set to an array of dataset IDs that the current dataset depends on. This ensures correct ordering when adding to or removing from the map (e.g., sources are always added before related layers, and layers are removed before their sources).

### Example: Layer depends on Source

```typescript
const sourceDataset = createDatasetPartMapboxSourceComponent('MySource');
const layerDataset = createDatasetPartMapboxLayerComponent('MyLayer', data);
layerDataset.dependsOn = [sourceDataset.id];

// When calling addDataset(layerDataset), the system will:
// 1. Run addToMap for sourceDataset
// 2. Then run addToMap for layerDataset
//
// When calling removeDataset(layerDataset), the system will:
// 1. Run removeFromMap for layerDataset
// 2. Then run removeFromMap for sourceDataset
```

**Tip:**

- You may have multiple dependencies: simply use an array of IDs: `layer.dependsOn = [source1.id, source2.id]`.
- You do not need to manually add or remove dependencies—the system handles the order automatically when using `addDataset` and `removeDataset`.

This mechanism prevents map errors due to layers referring to missing or already-removed sources, and helps maintain correct lifecycle relationships between compositional datasets.

### Managing Dependencies with addDependsOn & removeDependsOn

Every dataset object supports the methods `addDependsOn(input: string | IDataset)` and `removeDependsOn(input: string | IDataset)` for safe, programmatic management of the `dependsOn` array:

```typescript
const sourceDataset = createDatasetPartMapboxSourceComponent('MySource');
const layerDataset = createDatasetPartMapboxLayerComponent('MyLayer', data);

// Add dependency (will not duplicate if already present)
layerDataset.addDependsOn(sourceDataset); // or:
layerDataset.addDependsOn(sourceDataset.id);

// Remove dependency (safe: only removes if present)
layerDataset.removeDependsOn(sourceDataset); // or:
layerDataset.removeDependsOn(sourceDataset.id);
```

**Editorial guidance:**

- Use these methods if you need to dynamically update dependencies (for example, in UI builders, wizards, or editors) or want to avoid accidental duplication.
- For static cases, direct assignment like `layer.dependsOn = [source.id]` is fine (especially at factory/init time).
- Internally, these methods ensure the array is created if missing and prevent duplication/removal errors.

## Dataset Leaf Types

Leaf datasets represent specific functionalities. The main types are:

- **List UI**: Defines how the dataset appears in the layer control list and what user actions are available in the UI.
- **Layer**: Represents a map layer (point, line, fill, etc.).
- **Source**: Represents a data source (GeoJSON, raster, vector, etc.).
- **Identify**: Handles feature identification when clicking on the map.
- **Data Management**: Handles data fetching, detail display, and CRUD operations.
- **Highlight**: Handles highlighting features on the map when selected.

Each type has its own API and usage. See the corresponding documentation files in this folder for details and advanced usage.

## Example: Adding a Source Leaf

```typescript
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/vue-map-dataset';

const source = createDatasetPartGeojsonSourceComponent('my-source', {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Feature 1' },
      geometry: {
        type: 'Point',
        coordinates: [105.8342, 21.0285],
      },
    },
  ],
});
```

## Example: Adding a Layer Leaf

```typescript
import { createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const singleLayer = createMultiMapboxLayerComponent('single-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build()]);
```

## Example: Adding a List UI Leaf

```typescript
import { createDatasetPartListViewUiComponent } from '@hungpvq/vue-map-dataset';

const listView = createDatasetPartListViewUiComponent('My Layer');
listView.color = '#ff6b6b';
listView.opacity = 0.8;
```

## More Information

For detailed documentation on each dataset leaf type, see the following files in this folder:

- [list](./list) - List UI
- [layer](./layer) - Layer
- [source](./source) - Source
- [identify](./identify) - Identify
- [data-management]()./data-management) - Data Management
- [highlight](./highlight) - Highlight
- [Custom](./custom-leaf) - Custom

Each file contains in-depth explanations, API references, and advanced usage examples for its respective dataset component.
