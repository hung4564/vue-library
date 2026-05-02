# Layer Dataset Component

## Overview

The Layer dataset component defines how map layers are added and managed. Layers can represent points, lines, polygons, or other visual elements on the map.

## Use Cases

- Displaying vector or raster data on the map
- Styling map features (color, opacity, etc.)
- Managing multiple layers for complex visualizations

## Basic Usage: Single Layer

```typescript
import { createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const singleLayer = createMultiMapboxLayerComponent('single-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build()]);
```

## Multiple Layers

```typescript
const multiLayer = createMultiMapboxLayerComponent('multi-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(), new LayerSimpleMapboxBuild().setStyleType('line').setColor('#4ecdc4').build()]);
```

## API

- `createMultiMapboxLayerComponent(name: string, layers: LayerBuild[])`: Create a layer component with one or more layers
- `LayerSimpleMapboxBuild`: Builder for layer styles (type, color, etc.)

## Best Practices

- Use descriptive names for layers
- Group related layers for better management
- Use builders to standardize layer styles
