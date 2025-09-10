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
