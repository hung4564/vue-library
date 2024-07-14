# Action

## Sample

```ts
import { toBoundAction, toggleShowAction } from '@hungpvq/vue-map-layer';
toBoundAction - for show button fillbound
toggleShowAction - for show button toggle show
```

## Type

```ts
import { LayerAction, Menu } from '@hungpvq/vue-map-layer';
const action: LayerAction = {
  id: 'toggle-show',
  type: 'toggle-show',
  menu: {
    id: 'toggle-show',
    location: 'extra',
    type: 'item',
    name: 'Fly to',
    icon: () => {
      return ToggleShow;
    },
  },
};
const action: LayerAction = {
  id: 'to-bound',
  type: 'to-bound',
  menu: {
    id: 'to-bound',
    location: 'extra',
    type: 'item',
    name: 'Fly to',
    icon: mdiCrosshairsGps,
  },
};
const action: LayerAction = {
  id: 'call click',
  menu: {
    id: 'call click',
    location: 'menu',
    name: 'Call click',
    type: 'item',
    click(layer, map_id) {},
  },
};
```
