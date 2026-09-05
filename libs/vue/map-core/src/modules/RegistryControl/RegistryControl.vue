<script lang="ts">
export default {
  name: 'RegistryControl',
};
</script>
<script setup lang="ts">
import {
  filterMapControls,
  REGISTRY_CONTROL_LOCALE,
  type MapControlHandle,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiConsole } from '@mdi/js';
import { computed, onUnmounted, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl, UniversalRegistry } from '../../extra';
import { InputSelect } from '../../field';
import { defaultMapProps, useMap, useShow, WithShowProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const CONTROL_ID = 'mapRegistryControl';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
  position: 'top-right',
});

const [show, setShow] = useShow(props.show ?? false);
const { mapId, moduleContainerProps, order } = useMap({
  ...props,
  controlId: CONTROL_ID,
});
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(REGISTRY_CONTROL_LOCALE);

const controls = ref<MapControlHandle[]>([]);
const query = ref('');
const selectedId = ref('');
const actionType = ref('');
let refreshTimer: ReturnType<typeof setInterval> | undefined;

const filtered = computed(() =>
  filterMapControls(controls.value, query.value),
);

const selected = computed(
  () => controls.value.find((ctrl) => ctrl.id === selectedId.value) ?? null,
);

const propsJson = computed(() =>
  selected.value ? JSON.stringify(selected.value.props, null, 2) : '',
);

const actionTypeItems = computed(() => [
  {
    value: '',
    text: trans.value('map.registry-control.actionDefault'),
  },
  ...(selected.value?.actions ?? []).map((action) => ({
    value: action.type,
    text: action.type,
  })),
]);

const { panelBind } = useRegisterMapControl(mapId, {
  id: CONTROL_ID,
  panelKind: 'popup',
  title: () => trans.value('map.registry-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: CONTROL_ID,
      run: () => onToggleShow(),
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: CONTROL_ID,
  getState() {
    return {
      visible: true,
      active: show.value,
      title: trans.value('map.registry-control.title'),
      order: order.value,
      icon: {
        type: 'mdi' as const,
        path: mdiConsole,
      },
    };
  },
  onClick() {
    onToggleShow();
  },
});

watch(show, () => control.sync());

function onToggleShow() {
  setShow(!show.value);
}

function refresh() {
  if (!mapId.value) return;
  controls.value = UniversalRegistry.listControls(mapId.value);
  if (
    selectedId.value &&
    !controls.value.some((ctrl) => ctrl.id === selectedId.value)
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
        :title="trans('map.registry-control.title')"
        :height="580"
        :width="400"
        v-bind="{ ...slotProps, ...panelBind }"
      >
        <div
          class="map-registry-control"
          :aria-label="trans('map.registry-control.title')"
        >
          <header class="map-registry-control__header">
            <p class="map-registry-control__hint">
              {{ trans('map.registry-control.hint') }}
            </p>
            <button
              type="button"
              class="map-registry-control__btn"
              @click="refresh"
            >
              {{ trans('map.registry-control.refresh') }}
            </button>
          </header>

          <input
            v-model="query"
            type="search"
            class="map-registry-control__search"
            :aria-label="trans('map.registry-control.search')"
            :placeholder="trans('map.registry-control.searchPlaceholder')"
          />

          <p v-if="!filtered.length" class="map-registry-control__empty">
            {{ trans('map.registry-control.empty') }}
          </p>
          <ul v-else class="map-registry-control__list">
            <li
              v-for="ctrl in filtered"
              :key="ctrl.id"
              class="map-registry-control__item"
              :class="{ 'is-selected': selectedId === ctrl.id }"
            >
              <button
                type="button"
                class="map-registry-control__select"
                @click="select(ctrl.id)"
              >
                <strong>{{ ctrl.id }}</strong>
                <span>{{ ctrl.panelKind }}</span>
                <span v-if="ctrl.title">{{ ctrl.title }}</span>
                <span v-if="ctrl.panelKind !== 'button'">
                  {{
                    ctrl.isOpen()
                      ? trans('map.registry-control.openState')
                      : trans('map.registry-control.closedState')
                  }}
                </span>
              </button>
            </li>
          </ul>

          <section v-if="selected" class="map-registry-control__detail">
            <h3>{{ selected.id }}</h3>
            <pre class="map-registry-control__props">{{ propsJson }}</pre>

            <div class="map-registry-control__actions">
              <template v-if="selected.panelKind !== 'button'">
                <button
                  type="button"
                  class="map-registry-control__btn"
                  @click="open"
                >
                  {{ trans('map.registry-control.open') }}
                </button>
                <button
                  type="button"
                  class="map-registry-control__btn"
                  @click="close"
                >
                  {{ trans('map.registry-control.close') }}
                </button>
                <button
                  v-if="
                    selected.panelKind === 'popup' ||
                    selected.panelKind === 'float'
                  "
                  type="button"
                  class="map-registry-control__btn"
                  @click="movePopup"
                >
                  {{ trans('map.registry-control.movePopup') }}
                </button>
                <button
                  v-if="selected.panelKind === 'sidebar'"
                  type="button"
                  class="map-registry-control__btn"
                  @click="toggleSidebarSide"
                >
                  {{ trans('map.registry-control.toggleSidebar') }}
                </button>
              </template>

              <div class="map-registry-control__run">
                <InputSelect
                  v-model="actionType"
                  :label="trans('map.registry-control.actionType')"
                  :items="actionTypeItems"
                  item-value="value"
                  item-text="text"
                />
                <button
                  type="button"
                  class="map-registry-control__btn"
                  @click="run"
                >
                  {{ trans('map.registry-control.runAction') }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
