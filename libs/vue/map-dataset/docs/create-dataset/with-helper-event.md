# Events

Dataset nodes can emit typed events. List UI already has this helper; custom leaves can add it.

There are **no Vue `emit` / React callback props** on map controls for layer data. Subscribe on the **dataset node**.

## List UI events

```ts
type EventIListViewUI = {
  toggleShow: { show: boolean; dataset: IListViewUI };
  changeOpacity: { opacity: number; dataset: IListViewUI };
};
```

```ts
const list = createDatasetPartListViewUiComponentBuilder('Layer').build();

list.on('toggleShow', ({ show, dataset }) => {
  console.log(dataset.getName(), show);
});

list.on('changeOpacity', ({ opacity }) => {
  console.log(opacity);
});

list.off('toggleShow', handler); // optional unsubscribe
```

`LayerControl` toggling visibility / opacity calls these internally.

## Custom leaf

```ts
import { createDatasetLeaf, createWithEventHelper } from '@hungpvq/vue-map-dataset';

type MyEvents = { saved: { id: string } };

const event = createWithEventHelper<MyEvents>();

const leaf = {
  ...createDatasetLeaf('My leaf'),
  type: 'my-custom-type',
  ...event,
};

leaf.on('saved', ({ id }) => console.log(id));
leaf.emit('saved', { id: '1' });
```

`addDatasetWithEvent(parent)` copies the same `on` / `off` / `emit` onto an existing node.

See [Custom leaf](./custom-leaf.md).
