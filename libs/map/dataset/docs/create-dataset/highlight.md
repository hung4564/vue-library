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

- `createDatasetHighlightComponent(name: string)`: Create a highlight component with custom highlight logic

## Best Practices

- Use clear visual cues for highlighting
- Reset highlight state when appropriate
- Optimize performance for large datasets
