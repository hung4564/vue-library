<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      />
    </template>

    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        v-model:show="show"
        title="UniversalRegistry controls"
        :height="580"
        :width="400"
        v-bind="{ ...slotProps, ...panelBind }"
      >
        <div class="registry-control-panel" aria-label="UniversalRegistry controls">
          <header class="registry-control-panel__header">
            <p class="registry-control-panel__hint">
              UniversalRegistry.openControl / closeControl / setControlPosition /
              runControlAction
            </p>
            <button
              type="button"
              class="registry-control-panel__btn"
              @click="refresh"
            >
              Refresh
            </button>
          </header>

          <ul class="registry-control-panel__list">
            <li
              v-for="ctrl in controls"
              :key="ctrl.id"
              class="registry-control-panel__item"
              :class="{ 'is-selected': selectedId === ctrl.id }"
            >
              <button
                type="button"
                class="registry-control-panel__select"
                @click="select(ctrl.id)"
              >
                <strong>{{ ctrl.id }}</strong>
                <span>{{ ctrl.panelKind }}</span>
                <span v-if="ctrl.title">{{ ctrl.title }}</span>
                <span v-if="ctrl.panelKind !== 'button'">
                  {{ ctrl.isOpen() ? 'open' : 'closed' }}
                </span>
              </button>
            </li>
          </ul>

          <section v-if="selected" class="registry-control-panel__detail">
            <h3>{{ selected.id }}</h3>
            <pre class="registry-control-panel__props">{{ propsJson }}</pre>

            <div class="registry-control-panel__actions">
              <template v-if="selected.panelKind !== 'button'">
                <button
                  type="button"
                  class="registry-control-panel__btn"
                  @click="open"
                >
                  Open
                </button>
                <button
                  type="button"
                  class="registry-control-panel__btn"
                  @click="close"
                >
                  Close
                </button>
                <button
                  v-if="
                    selected.panelKind === 'popup' ||
                    selected.panelKind === 'float'
                  "
                  type="button"
                  class="registry-control-panel__btn"
                  @click="movePopup"
                >
                  Move popup
                </button>
                <button
                  v-if="selected.panelKind === 'sidebar'"
                  type="button"
                  class="registry-control-panel__btn"
                  @click="toggleSidebarSide"
                >
                  Toggle sidebar side
                </button>
              </template>

              <div class="registry-control-panel__run">
                <InputSelect
                  v-model="actionType"
                  label="Action type"
                  :items="actionTypeItems"
                  item-value="value"
                  item-text="text"
                />
                <button
                  type="button"
                  class="registry-control-panel__btn"
                  @click="run"
                >
                  runAction
                </button>
              </div>
            </div>
          </section>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>

<script setup lang="ts">
import type { MapControlHandle, WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  InputSelect,
  MapCommonButton,
  ModuleContainer,
  UniversalRegistry,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
  WithShowProps,
} from '@hungpvq/vue-map-core';
import { mdiConsole } from '@mdi/js';
import { computed, onUnmounted, ref, watch } from 'vue';
import './registry-control-demo.css';

const CONTROL_ID = 'demoRegistryControl';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
  show: true,
  position: 'top-right',
});

const [show, setShow] = useShow(props.show);
const { mapId, moduleContainerProps, order } = useMap({
  ...props,
  controlId: CONTROL_ID,
});

const controls = ref<MapControlHandle[]>([]);
const selectedId = ref('');
const actionType = ref('');
let refreshTimer: ReturnType<typeof setInterval> | undefined;

const selected = computed(
  () => controls.value.find((c) => c.id === selectedId.value) ?? null,
);

const propsJson = computed(() =>
  selected.value ? JSON.stringify(selected.value.props, null, 2) : '',
);

const actionTypeItems = computed(() => [
  { value: '', text: '(default / single)' },
  ...(selected.value?.actions ?? []).map((action) => ({
    value: action.type,
    text: action.type,
  })),
]);

const { panelBind } = useRegisterMapControl(mapId, {
  id: CONTROL_ID,
  panelKind: 'popup',
  title: 'UniversalRegistry controls',
  buttonPosition: () => props.position,
  show,
  setShow,
  actions: [
    {
      type: CONTROL_ID,
      run: () => setShow(),
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: CONTROL_ID,
  getState() {
    return {
      visible: true,
      active: show.value,
      title: 'UniversalRegistry controls',
      order: order.value,
      icon: {
        type: 'mdi' as const,
        path: mdiConsole,
      },
    };
  },
  onClick() {
    setShow();
  },
});

watch(show, () => control.sync());

function refresh() {
  if (!mapId.value) return;
  controls.value = UniversalRegistry.listControls(mapId.value);
  if (
    selectedId.value &&
    !controls.value.some((c) => c.id === selectedId.value)
  ) {
    selectedId.value = '';
    actionType.value = '';
  }
}

function select(id: string) {
  selectedId.value = id;
  actionType.value = '';
  refresh();
}

function open() {
  if (!selectedId.value) return;
  UniversalRegistry.openControl(mapId.value, selectedId.value);
  refresh();
}

function close() {
  if (!selectedId.value) return;
  UniversalRegistry.closeControl(mapId.value, selectedId.value);
  refresh();
}

function movePopup() {
  if (!selectedId.value) return;
  UniversalRegistry.setControlPosition(mapId.value, selectedId.value, {
    top: 80 + Math.round(Math.random() * 120),
    right: 60 + Math.round(Math.random() * 80),
  });
  refresh();
}

function toggleSidebarSide() {
  if (!selected.value) return;
  const current = selected.value.getPanelPosition().location || 'left';
  UniversalRegistry.setControlPosition(mapId.value, selected.value.id, {
    location: current === 'left' ? 'right' : 'left',
  });
  refresh();
}

function run() {
  if (!selectedId.value) return;
  UniversalRegistry.runControlAction(
    mapId.value,
    selectedId.value,
    actionType.value || undefined,
  );
  refresh();
}

watch(
  mapId,
  (id) => {
    if (!id) return;
    refresh();
    let n = 0;
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      refresh();
      n += 1;
      if (n >= 8 && refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = undefined;
      }
    }, 250);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
