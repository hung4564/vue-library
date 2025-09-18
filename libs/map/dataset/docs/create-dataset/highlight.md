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

## Best Practices

- Use clear visual cues for highlighting
- Reset highlight state when appropriate
- Optimize performance for large datasets
