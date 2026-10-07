# Custom controls with `useMapControl`

Canonical pattern for app / library authors: **`useMap` + `useMapControl` + `ModuleContainer`**.

Related: [UniversalRegistry controls](../../registry-controls.md), [Toolbar kinds](../../toolbar.md).

## Checklist

1. Stable **control id** (`myFooControl`) — used by registry + layout store.
2. `from: props` (+ `order` from `useMap`) so position / `buttonInMobile` / popup defaults apply.
3. Declare **`host.button`** and **`toolbar`** independently (same object is fine for simple chrome).
4. Prefer **auto** host chrome (omit `#btn` / `btn`). Use `host.buttonSlot: 'custom'` only for non-standard UI.
5. `setShow` must accept `true` / `false` (not toggle-only) when you have a panel.

| Chrome kind | Host (corner) | Strip (`toolbar` / `menu`) |
| --- | --- | --- |
| `single` | One auto button | Same button on strip |
| `module` | All buttons in a group | Same group on strip |
| `module-expandable` | Launcher; options L/R by corner | Launcher + secondary row |
| `buttonSlot: 'custom'` | Your `#btn` / `btn` | Still use `toolbar` if needed |

Imports (Vue): `@hungpvq/vue-map-core` + `@hungpvq/map-core/toolbar`.  
Imports (React): `@hungpvq/react-map-core` + `@hungpvq/map-core/toolbar`.

---

## 1. `single` — action button (auto)

Like Home: one click, no panel.

### Vue

```vue
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  ModuleContainer,
  defaultMapProps,
  useMap,
  useMapControl,
} from '@hungpvq/vue-map-core';
import { mdiStar } from '@mdi/js';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, order, callMap } = useMap(props);

function onPing() {
  callMap((map) => {
    map.flyTo({ center: map.getCenter(), zoom: map.getZoom() + 1 });
  });
}

const chrome = {
  kind: 'single' as const,
  getState: () =>
    mdiButtonState(mdiStar, { title: 'Ping', order: order.value }),
  onClick: () => onPing(),
};

const { moduleContainerProps } = useMapControl(mapId, {
  id: 'myPingControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: chrome },
  toolbar: chrome,
  actions: [{ type: 'myPingControl', run: () => onPing() }],
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps" />
</template>
```

### React

```tsx
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  ModuleContainer,
  defaultMapProps,
  useMap,
  useMapControl,
} from '@hungpvq/react-map-core';
import { mdiStar } from '@mdi/js';

export function PingControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, order, callMap } = useMap(merged);

  function onPing() {
    callMap((map) => {
      map.flyTo({ center: map.getCenter(), zoom: map.getZoom() + 1 });
    });
  }

  const chrome = {
    kind: 'single' as const,
    getState: () => mdiButtonState(mdiStar, { title: 'Ping', order }),
    onClick: () => onPing(),
  };

  const { moduleContainerProps } = useMapControl(mapId, {
    id: 'myPingControl',
    panelKind: 'button',
    from: merged,
    order,
    host: { button: chrome },
    toolbar: chrome,
    actions: [{ type: 'myPingControl', run: () => onPing() }],
  });

  return <ModuleContainer {...moduleContainerProps} />;
}
```

---

## 2. `single` + popup panel

Like Info: button toggles a draggable popup. Use `useShow` + `panelBind` + `#draggable`.

### Vue

```vue
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  defaultMapProps,
  useMap,
  useMapControl,
  useShow,
} from '@hungpvq/vue-map-core';
import { mdiCog } from '@mdi/js';
import { watch } from 'vue';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, order } = useMap(props);
const [show, setShow] = useShow(props.show);

const chrome = {
  kind: 'single' as const,
  getState: () =>
    mdiButtonState(mdiCog, {
      title: 'Notes',
      active: show.value,
      order: order.value,
    }),
  onClick: () => setShow(!show.value),
};

const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
  id: 'myNotesControl',
  panelKind: 'popup',
  title: () => 'Notes',
  from: props,
  order,
  show,
  setShow,
  defaultPanelSize: { width: 320, height: 240 },
  host: { button: chrome },
  toolbar: chrome,
  actions: [{ type: 'myNotesControl', run: () => setShow(true) }],
});

watch(show, () => control.sync());
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-if="show"
        v-bind="{ ...bind, ...panelBind }"
        v-model:show="show"
        title="Notes"
      >
        <div class="p-3">Your panel content</div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
```

React: same options; use `draggable={(bind) => show ? <DraggableItemPopup … /> : null}` and `useEffect(() => control.sync(), [show, control])`.

---

## 3. `module` — several corner buttons

Like Zoom: a fixed group. Auto-render shows every visible button.

### Vue

```vue
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  ModuleContainer,
  defaultMapProps,
  useMap,
  useMapControl,
} from '@hungpvq/vue-map-core';
import { mdiMinus, mdiPlus } from '@mdi/js';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, order, callMap } = useMap(props);

const chrome = {
  kind: 'module' as const,
  moduleId: 'myZoomLite',
  order: order.value,
  buttons: [
    {
      id: 'in',
      getState: () => mdiButtonState(mdiPlus, { title: 'In' }),
      onClick: () => callMap((m) => m.zoomIn()),
    },
    {
      id: 'out',
      getState: () => mdiButtonState(mdiMinus, { title: 'Out' }),
      onClick: () => callMap((m) => m.zoomOut()),
    },
  ],
};

const { moduleContainerProps } = useMapControl(mapId, {
  id: 'myZoomLiteControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: chrome },
  toolbar: chrome,
  defaultActionType: 'in',
  actions: [
    { type: 'in', run: () => callMap((m) => m.zoomIn()) },
    { type: 'out', run: () => callMap((m) => m.zoomOut()) },
  ],
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps" />
</template>
```

---

## 4. `module-expandable` — launcher + options

Like Theme / Language: one launcher; options open beside it on the corner (`*-left` → right, `*-right` → left) and on the strip secondary row.

Use the **same** options object for `host.button` and `toolbar` (auto host — no `#btn`).

### Vue

```vue
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  ModuleContainer,
  defaultMapProps,
  useMap,
  useMapControl,
} from '@hungpvq/vue-map-core';
import { mdiPalette, mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import { computed, ref, watch } from 'vue';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, order } = useMap(props);
const mode = ref<'light' | 'dark'>('light');

const modeButtons = [
  {
    id: 'light',
    getState: () =>
      mdiButtonState(mdiWeatherSunny, {
        title: 'Light',
        active: mode.value === 'light',
      }),
    onClick: () => {
      mode.value = 'light';
    },
  },
  {
    id: 'dark',
    getState: () =>
      mdiButtonState(mdiWeatherNight, {
        title: 'Dark',
        active: mode.value === 'dark',
      }),
    onClick: () => {
      mode.value = 'dark';
    },
  },
];

const chrome = computed(() => ({
  kind: 'module-expandable' as const,
  moduleId: 'myThemeLite',
  orientation: 'row' as const,
  order: order.value,
  expandableButton: ({ active }: { active: boolean }) =>
    mdiButtonState(mdiPalette, { title: 'Theme', active }),
  buttons: modeButtons,
}));

const { moduleContainerProps, control } = useMapControl(mapId, {
  id: 'myThemeLiteControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: chrome },
  toolbar: chrome,
  actions: () => [
    {
      type: 'myThemeLiteControl',
      run: () => {
        mode.value = mode.value === 'light' ? 'dark' : 'light';
      },
    },
    {
      type: 'myThemeLiteControl:light',
      run: () => {
        mode.value = 'light';
      },
    },
    {
      type: 'myThemeLiteControl:dark',
      run: () => {
        mode.value = 'dark';
      },
    },
  ],
});

watch(mode, () => control.sync());
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps" />
</template>
```

Mount a `ToolbarControl` on the map when any control uses `controlLayout: 'toolbar'` or mobile `buttonInMobile: 'toolbar' | 'menu'`.

---

## 5. Dual chrome (host ≠ strip)

Host can show a full `module` while the strip uses `module-expandable` (or the reverse). **No merge / fallback** — declare both.

```ts
const buttons = [/* … */];

host: {
  button: {
    kind: 'module',
    moduleId: 'myTools',
    orientation: 'row',
    buttons,
  },
},
toolbar: {
  kind: 'module-expandable',
  moduleId: 'myTools',
  expandableButton: ({ active }) =>
    mdiButtonState(mdiTools, { title: 'Tools', active }),
  orientation: 'row',
  buttons,
},
```

---

## 6. `buttonSlot: 'custom'` — non-standard `#btn`

Only when auto chrome is not enough (thumbnail card, custom Draw toolbar, …). You still pass `host.button` / `toolbar` if the strip or strategy state is needed; for a fully custom corner with no strip chrome, `host: { buttonSlot: 'custom' }` alone is enough.

### Vue

```vue
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import {
  ModuleContainer,
  MapControlButton,
  defaultMapProps,
  useMap,
  useMapControl,
} from '@hungpvq/vue-map-core';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, order } = useMap(props);

const { moduleContainerProps } = useMapControl(mapId, {
  id: 'myBadgeControl',
  panelKind: 'button',
  from: props,
  order,
  host: { buttonSlot: 'custom' },
});

function onClick() {
  /* … */
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton @click="onClick">
        <span class="text-xs font-bold">OK</span>
      </MapControlButton>
    </template>
  </ModuleContainer>
</template>
```

---

## App-side registry

```ts
import { UniversalRegistry } from '@hungpvq/map-core';

UniversalRegistry.openControl(mapId, 'myNotesControl');
UniversalRegistry.closeControl(mapId, 'myNotesControl');
UniversalRegistry.setControlLayout(mapId, 'myPingControl', {
  controlLayout: 'toolbar',
});
UniversalRegistry.runControlAction(mapId, 'myPingControl');
UniversalRegistry.runControlAction(mapId, 'myThemeLiteControl', 'dark');
```

## Tips

- After local UI state changes that affect the button, call `control.sync()`.
- Prefer `mdiButtonState` / `textButtonState` from `@hungpvq/map-core/toolbar`.
- Do not set both `:width` on the popup and `defaultPanelSize` — use `defaultPanelSize` (or `panelBind`) only.
- Dual popups: put an explicit `id` **after** `{...panelBind}`.
