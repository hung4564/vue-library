# Layer Simple Mapbox Build

## Usecase

- Provide a fluent API for building Mapbox layer specifications with common styling options.
- Simplify the creation of standard layer types (point, line, area, symbol) with sensible defaults.
- Enable method chaining for easy layer configuration.
- Generate layer specifications that can be used with Mapbox GL JS layers.

## Properties

| Property  | Description             | Type                  | Default Value |
| --------- | ----------------------- | --------------------- | ------------- |
| `color`   | Color for the layer     | `Color \| undefined`  | `undefined`   |
| `opacity` | Opacity for the layer   | `number \| undefined` | `undefined`   |
| `type`    | Style type of the layer | `LayerStyleType`      | `'point'`     |

## Methods

| Method         | Description                   | Parameters                  | Return Type               |
| -------------- | ----------------------------- | --------------------------- | ------------------------- |
| `setColor`     | Set the color for the layer   | `color: Color \| undefined` | `LayerSimpleMapboxBuild`  |
| `setStyleType` | Set the style type            | `type: LayerStyleType`      | `LayerSimpleMapboxBuild`  |
| `setOpacity`   | Set the opacity for the layer | `opacity: number`           | `LayerSimpleMapboxBuild`  |
| `build`        | Build the layer specification | -                           | `Omit<LayerMapbox, 'id'>` |

## Types

### LayerStyleType

```typescript
type LayerStyleType = 'point' | 'line' | 'area' | 'symbol';
```

- `'point'` - Creates a circle layer for point features
- `'line'` - Creates a line layer for line features
- `'area'` - Creates a fill layer for polygon features
- `'symbol'` - Creates a symbol layer for text/icon features

## Usage

### Basic Point Layer

```typescript
import { LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const layer = new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').setOpacity(0.8).build();
```

### Line Layer

```typescript
const lineLayer = new LayerSimpleMapboxBuild().setStyleType('line').setColor('#4ecdc4').setOpacity(1.0).build();
```

### Area Layer

```typescript
const areaLayer = new LayerSimpleMapboxBuild().setStyleType('area').setColor('#45b7d1').setOpacity(0.6).build();
```

### Symbol Layer

```typescript
const symbolLayer = new LayerSimpleMapboxBuild().setStyleType('symbol').build();
```

### With Dataset Integration

```typescript
import { createDataset, createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

// Create dataset
const dataset = createDataset('Sample Dataset', null, true);

// Create layer with builder
const layerSpec = new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').setOpacity(0.8).build();

// Create layer component
const layer = createMultiMapboxLayerComponent('sample-layer', [layerSpec]);

dataset.add(layer);
```

### Method Chaining

```typescript
// All methods return the builder instance for chaining
const layer = new LayerSimpleMapboxBuild().setStyleType('line').setColor('#e74c3c').setOpacity(0.9).build();
```

### Default Values

```typescript
// Uses default values when not specified
const defaultLayer = new LayerSimpleMapboxBuild().build();
// Results in: point layer with random color and full opacity
```

## Generated Layer Specifications

### Point Layer (Circle)

```typescript
{
  layout: { visibility: 'visible' },
  type: 'circle',
  paint: {
    'circle-color': '#ff6b6b',
    'circle-radius': 6,
    'circle-opacity': 0.8
  }
}
```

### Line Layer Specification

```typescript
{
  layout: { visibility: 'visible' },
  type: 'line',
  paint: {
    'line-color': '#4ecdc4',
    'line-width': 4,
    'line-opacity': 1.0
  }
}
```

### Area Layer Specification (Fill)

```typescript
{
  layout: { visibility: 'visible' },
  type: 'fill',
  paint: {
    'fill-color': '#45b7d1',
    'fill-opacity': 0.6
  }
}
```

### Symbol Layer Specification

```typescript
{
  layout: { visibility: 'visible' },
  type: 'symbol',
  paint: {}
}
```

## Features

- **Fluent API** - Method chaining for easy configuration
- **Type Safety** - Full TypeScript support with proper type definitions
- **Default Values** - Sensible defaults for common styling options
- **Random Colors** - Automatic random color generation when color is not specified
- **Mapbox Compatible** - Generates specifications compatible with Mapbox GL JS
- **Multiple Layer Types** - Support for point, line, area, and symbol layers
