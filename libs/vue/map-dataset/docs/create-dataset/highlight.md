# Highlight Dataset Component

## Overview

The Highlight dataset component manages feature highlighting on the map, typically in response to user actions such as selection or identification.

## Use Cases

- Highlighting features when selected in the UI
- Emphasizing features after an identify or search operation
- Providing visual feedback for user interactions

## Basic Usage Example

```typescript
const highlight = createDatasetHighlightComponent('Highlight');
```

## API

This library provides factory functions for creating highlight components to visually emphasize features on a Mapbox map.
These components make it easy to define custom highlight logic, change colors, or apply other visual effects without repeating code.

- `createDatasetHighlightComponent(data?: Partial<LayerSpecification>)`
  Creates a basic highlight component with default highlight logic. Useful when you simply want to emphasize a set of features or layers on the map.

- `createDatasetPartChangeColorHighlightComponent(data?: Partial<LayerSpecification>)`
  Creates a highlight component with the ability to customize highlight colors for different parts of a dataset. Suitable when you need different highlight styles based on states, groups, or conditions.

- custom

```ts
import type { MapSimple } from '@hungpvq/shared-map';
import { createDatasetPartCustomAnimateHighlightComponent, type IHighlightView } from '@hungpvq/vue-map-dataset';
import type { LayerSpecification } from 'maplibre-gl';

export function createDatasetCustomHighlightComponent(data?: Partial<LayerSpecification>): IHighlightView {
  function animateFn({ layerIds, map, state }: { map: MapSimple; layerIds: Record<string, string>; state: { color: string; startTime: number } }) {
    const t = (performance.now() - state.startTime) / 1000; // giây
    const c = state.color;
    const radius = 6 + Math.sin(t * 3) * 2;
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);
    map.setPaintProperty(layerIds.point, 'circle-stroke-color', c);
    map.setPaintProperty(layerIds.point, 'circle-radius', radius);

    map.setPaintProperty(layerIds.line, 'line-color', c);
    map.setPaintProperty(layerIds.line, 'line-width', radius);

    map.setPaintProperty(layerIds.polygon, 'fill-color', c);
    map.setPaintProperty(layerIds.polygon, 'fill-opacity', opacity);
  }

  return createDatasetPartCustomAnimateHighlightComponent<{
    color: string;
    startTime: number;
  }>(
    animateFn,
    () => ({
      color: '#880808',
      startTime: performance.now(),
    }),
    data,
  );
}
```

## Best Practices

- Use clear visual cues for highlighting
- Reset highlight state when appropriate
- Optimize performance for large datasets
