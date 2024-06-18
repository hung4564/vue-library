# Legend

```ts
import { LayerLegendBuild, LayerLegendSingleColor, LayerLegendLinearGradient } from '@hungpvq/vue-map-layer';
new LayerLegendBuild().setFields([
  { option: { text: 'legend text', value: 'test' } },
  {
    option: { color: '#fff', text: 'legend color' },
    component: LayerLegendSingleColor,
  },
  {
    text: 'legend linear',
    option: {
      items: [
        { value: 'test 1', color: '#fff' },
        { value: 'test 2', color: '#000' },
        { value: 'test 3', color: 'red' },
      ],
    },
    component: LayerLegendLinearGradient,
  },
]);
```

### Method

| State     | Props   | Type       | Description |
| --------- | ------- | ---------- | ----------- |
| setFields | Field[] | `function` | set fields  |
| addField  | Field   | `function` | add field   |

### LayerLegendSingleText

component default

```ts
type Field = {
  text: string;
  value: string;
};
```

### LayerLegendSingleColor

```ts
type Field = {
  text: string;
  option: { color: string };
  value?: string;
};
```

### LayerLegendLinearGradient

```ts
type Field = {
  text: string;
  option: {
    items: {
      color: string;
      value: string;
    }[];
  };
};
```
