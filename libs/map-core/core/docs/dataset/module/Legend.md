# Legend helpers

Attach a legend block to a list UI node. Components are registered by `createDatasetRegistryPlugin()`.

**Events:** none (pure data + UI).

## `createLegend(type, value)`

| `type` | `value` |
| --- | --- |
| `'color'` | `{ text: string, color: string }` |
| `'text'` | `{ text: string, value: string }` |
| `'linear'` | `{ text: string, items: { color: string, value: string }[] }` |

```ts
import { createLegend } from '@hungpvq/vue-map-dataset';

createLegend('color', { text: 'Fill', color: '#4ecdc4' });
createLegend('text', { text: 'Class', value: 'urban' });
createLegend('linear', {
  text: 'Density',
  items: [
    { value: 'low', color: '#fff' },
    { value: 'high', color: '#000' },
  ],
});
```

Returns `{ componentKey: 'legend-color' | 'legend-text' | 'legend-linear', attr: { value } }`.

## `createMultiLegend(items)`

Several legends stacked.

```ts
import { createMultiLegend, createDatasetPartListViewUiComponentBuilder } from '@hungpvq/vue-map-dataset';

const list = createDatasetPartListViewUiComponentBuilder('Layer')
  .configInitShowLegend()
  .setLegend(
    createMultiLegend([
      { type: 'color', value: { text: 'Fill', value: '#4ecdc4' } },
      { type: 'text', value: { text: 'Name', value: 'District' } },
      {
        type: 'linear',
        value: {
          text: 'Scale',
          items: [
            { value: '1', color: '#fff' },
            { value: '2', color: '#000' },
          ],
        },
      },
    ]),
  )
  .build();
```

`createLegend('color', …)` types `{ text, color }`. The color swatch reads `color`; an optional `value` string is shown next to it. Demos often pass `{ text, value: '#hex' }` in `createMultiLegend`.
