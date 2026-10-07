<script lang="ts">
export default {
  name: 'RegistryControl',
};
</script>
<script setup lang="ts">
import {
  type ButtonInMobile,
  type ControlLayout,
  filterMapControls,
  type MapControlHandle,
  type MapControlPanelPosition,
  moduleDraggableHostId,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup, useDragStore } from '@hungpvq/vue-draggable';
import { mdiConsole } from '@mdi/js';
import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import type { MapTabItem } from '../../components/map-tabs';
import MapControlButton from '../../components/MapControlButton.vue';
import MapTabs from '../../components/MapTabs.vue';
import { useLang } from '../../extra/lang/hook';
import { UniversalRegistry } from '../../extra/registry/plugin';
import { useMapControl } from '../../extra/registry/useMapControl';
import { InputCheckbox, InputSelect, InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow, WithShowProps } from '../../hooks/useShow';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const CONTROL_ID = 'mapRegistryControl';

type PanelOffsetDraft = {
  top: string;
  right: string;
  bottom: string;
  left: string;
  width: string;
  height: string;
  location: 'left' | 'right' | 'top' | 'bottom';
  /** Desired open/closed after Apply panel. */
  open: boolean;
};

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
  position: 'top-right',
});

const [show, setShow] = useShow(props.show ?? false);
const showDetail = ref(false);
const { mapId, order } = useMap({
  ...props,
  controlId: CONTROL_ID,
});
const { trans } = useLang(mapId.value);
const controls = ref<MapControlHandle[]>([]);
const query = ref('');
const selectedId = ref('');
const actionType = ref('');
let refreshTimer: ReturnType<typeof setInterval> | undefined;

const layoutDraft = reactive({
  visible: true,
  position: 'bottom-right' as Position,
  order: 0,
  controlLayout: 'standalone' as ControlLayout,
  buttonInMobile: '' as '' | ButtonInMobile,
});

const panelDraft = reactive<PanelOffsetDraft>({
  top: '',
  right: '',
  bottom: '',
  left: '',
  width: '',
  height: '',
  location: 'left',
  open: false,
});

const detailTab = ref('props');

const filtered = computed(() => filterMapControls(controls.value, query.value));

const selected = computed(
  () => controls.value.find((ctrl) => ctrl.id === selectedId.value) ?? null,
);

const showPanelSection = computed(() => {
  const kind = selected.value?.panelKind;
  return kind === 'popup' || kind === 'float' || kind === 'sidebar';
});

/** Popup/float only use the two edges of the button corner (e.g. bottom-right). */
const panelEdgeFields = computed(() => {
  const corner = layoutDraft.position;
  return {
    top: corner.includes('top'),
    bottom: corner.includes('bottom'),
    left: corner.includes('left'),
    right: corner.includes('right'),
  };
});

const detailTabItems = computed((): MapTabItem[] => {
  const items: MapTabItem[] = [
    {
      id: 'props',
      label: trans.value('map.registry-control.propsSection'),
    },
    {
      id: 'layout',
      label: trans.value('map.registry-control.layoutSection'),
    },
  ];
  if (showPanelSection.value) {
    items.push({
      id: 'panel',
      label: trans.value('map.registry-control.panelSection'),
    });
  }
  return items;
});

watch(showPanelSection, (show) => {
  if (!show && detailTab.value === 'panel') detailTab.value = 'layout';
});

watch(selectedId, () => {
  detailTab.value = 'props';
});

const detailTitle = computed(() =>
  selected.value
    ? selected.value.title
      ? `${selected.value.id} · ${selected.value.title}`
      : selected.value.id
    : trans.value('map.registry-control.detailTitle'),
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

const positionItems = [
  { value: 'top-left', text: 'top-left' },
  { value: 'top-right', text: 'top-right' },
  { value: 'bottom-left', text: 'bottom-left' },
  { value: 'bottom-right', text: 'bottom-right' },
];

const controlLayoutItems = [
  { value: 'standalone', text: 'standalone' },
  { value: 'toolbar', text: 'toolbar' },
  { value: 'button', text: 'button' },
];

const locationItems = [
  { value: 'left', text: 'left' },
  { value: 'right', text: 'right' },
  { value: 'top', text: 'top' },
  { value: 'bottom', text: 'bottom' },
];

const buttonInMobileItems = computed(() => [
  {
    value: '',
    text: trans.value('map.registry-control.layoutInherit'),
  },
  { value: 'button', text: 'button' },
  { value: 'toolbar', text: 'toolbar' },
  { value: 'menu', text: 'menu' },
]);

const singleButton = {
  kind: 'single' as const,
  getState() {
    return mdiButtonState(mdiConsole, {
      visible: true,
      active: show.value,
      title: trans.value('map.registry-control.title'),
      order: order.value,
    });
  },
  onClick() {
    onToggleShow();
  },
};
const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
  id: CONTROL_ID,
  panelKind: 'popup',
  title: () => trans.value('map.registry-control.title'),
  from: props,
  order,
  show,
  setShow,
  defaultPanelSize: { width: 360, height: 420 },
  actions: [
    {
      type: CONTROL_ID,
      run: () => onToggleShow(),
    },
  ],
  host: { button: singleButton },
  toolbar: singleButton,
});

watch(show, (visible) => {
  control?.sync();
  if (!visible) {
    closeDetail();
  }
});

watch(showDetail, (visible) => {
  if (!visible && selectedId.value) {
    selectedId.value = '';
    actionType.value = '';
  }
});

function onToggleShow() {
  setShow(!show.value);
}

function closeDetail() {
  showDetail.value = false;
  selectedId.value = '';
  actionType.value = '';
}

function syncLayoutDraft(ctrl: MapControlHandle | null) {
  if (!ctrl?.getLayout) return;
  const lay = ctrl.getLayout();
  layoutDraft.visible = lay.visible;
  layoutDraft.position = lay.position;
  layoutDraft.order = lay.order;
  layoutDraft.controlLayout = lay.controlLayout;
  layoutDraft.buttonInMobile = lay.buttonInMobile ?? '';
}

function syncPanelDraft(ctrl: MapControlHandle | null) {
  if (!ctrl) return;
  const pos = ctrl.getPanelPosition();
  panelDraft.top = pos.top != null ? String(pos.top) : '';
  panelDraft.right = pos.right != null ? String(pos.right) : '';
  panelDraft.bottom = pos.bottom != null ? String(pos.bottom) : '';
  panelDraft.left = pos.left != null ? String(pos.left) : '';
  panelDraft.width = pos.width != null ? String(pos.width) : '';
  panelDraft.height = pos.height != null ? String(pos.height) : '';
  panelDraft.location = pos.location || 'left';
  panelDraft.open = ctrl.isOpen();
}

const dragStore = useDragStore();
/** Skip bounds→draft sync while Apply panel is settling setPanelPosition. */
let applyingPanel = false;
watch(
  () => {
    if (!showDetail.value || !selectedId.value || !mapId.value) return null;
    const containerId = moduleDraggableHostId(mapId.value);
    return dragStore.container[containerId]?.layouts?.[selectedId.value]
      ?.bounds;
  },
  () => {
    if (applyingPanel) return;
    if (!showDetail.value || !selectedId.value) return;
    const ctrl = controls.value.find((c) => c.id === selectedId.value) ?? null;
    syncPanelDraft(ctrl);
  },
  { deep: true },
);

function parseOptionalNumber(
  raw: string | number | null | undefined,
): number | undefined {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : undefined;
  }
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function refresh() {
  if (!mapId.value) return;
  controls.value = UniversalRegistry.listControls(mapId.value);
  if (
    selectedId.value &&
    !controls.value.some((ctrl) => ctrl.id === selectedId.value)
  ) {
    closeDetail();
    return;
  }
  if (selectedId.value) {
    const ctrl = controls.value.find((c) => c.id === selectedId.value);
    syncLayoutDraft(ctrl ?? null);
    syncPanelDraft(ctrl ?? null);
  }
}

function select(id: string) {
  selectedId.value = id;
  actionType.value = '';
  showDetail.value = true;
  refresh();
}

function applyLayout() {
  if (!selectedId.value) return;
  UniversalRegistry.setControlLayout(mapId.value, selectedId.value, {
    visible: layoutDraft.visible,
    position: layoutDraft.position,
    order: Number(layoutDraft.order) || 0,
    controlLayout: layoutDraft.controlLayout,
    buttonInMobile: layoutDraft.buttonInMobile
      ? layoutDraft.buttonInMobile
      : undefined,
  });
  refresh();
}

function applyPanel() {
  if (!selectedId.value || !selected.value) return;
  const kind = selected.value.panelKind;
  const pos: MapControlPanelPosition = {};
  if (kind === 'sidebar') {
    pos.location = panelDraft.location;
  } else {
    const edges = panelEdgeFields.value;
    if (edges.top) {
      const top = parseOptionalNumber(panelDraft.top);
      if (top != null) pos.top = top;
    }
    if (edges.right) {
      const right = parseOptionalNumber(panelDraft.right);
      if (right != null) pos.right = right;
    }
    if (edges.bottom) {
      const bottom = parseOptionalNumber(panelDraft.bottom);
      if (bottom != null) pos.bottom = bottom;
    }
    if (edges.left) {
      const left = parseOptionalNumber(panelDraft.left);
      if (left != null) pos.left = left;
    }
    const width = parseOptionalNumber(panelDraft.width);
    const height = parseOptionalNumber(panelDraft.height);
    if (width != null) pos.width = width;
    if (height != null) pos.height = height;
  }
  const snapshot = {
    top: panelDraft.top,
    right: panelDraft.right,
    bottom: panelDraft.bottom,
    left: panelDraft.left,
    width: panelDraft.width,
    height: panelDraft.height,
    location: panelDraft.location,
    open: panelDraft.open,
  };
  applyingPanel = true;
  UniversalRegistry.setControlPosition(mapId.value, selectedId.value, pos);
  // Wait for useMapControl setPanelPosition close→writeBounds→reopen tick,
  // then apply show state. Avoid refresh/sync reading stale drag bounds.
  void nextTick(() => {
    if (snapshot.open) {
      UniversalRegistry.openControl(mapId.value, selectedId.value);
    } else {
      UniversalRegistry.closeControl(mapId.value, selectedId.value);
    }
    refresh();
    panelDraft.top = snapshot.top;
    panelDraft.right = snapshot.right;
    panelDraft.bottom = snapshot.bottom;
    panelDraft.left = snapshot.left;
    panelDraft.width = snapshot.width;
    panelDraft.height = snapshot.height;
    panelDraft.location = snapshot.location;
    panelDraft.open = snapshot.open;
    applyingPanel = false;
  });
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
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        v-model:show="show"
        :title="trans('map.registry-control.title')"
        v-bind="{ ...slotProps, ...panelBind }"
        :id="`${CONTROL_ID}-list`"
      >
        <div
          class="map-registry-control map-registry-control--list"
          :aria-label="trans('map.registry-control.title')"
        >
          <header class="map-registry-control__header">
            <p class="map-registry-control__hint">
              {{ trans('map.registry-control.hint') }}
            </p>
            <MapControlButton
              class="map-registry-control__btn"
              variant="outlined"
              size="small"
              @click="refresh"
            >
              {{ trans('map.registry-control.refresh') }}
            </MapControlButton>
          </header>

          <input
            v-model="query"
            type="search"
            class="map-registry-control__search"
            :aria-label="trans('map.registry-control.search')"
            :placeholder="trans('map.registry-control.searchPlaceholder')"
          />

          <p
            v-if="!filtered.length"
            class="map-registry-control__empty"
          >
            {{ trans('map.registry-control.empty') }}
          </p>
          <ul
            v-else
            class="map-registry-control__list"
          >
            <li
              v-for="ctrl in filtered"
              :key="ctrl.id"
              class="map-registry-control__item"
              :class="{ 'is-selected': selectedId === ctrl.id }"
            >
              <div
                class="map-registry-control__select clickable"
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
              </div>
            </li>
          </ul>
        </div>
      </DraggableItemPopup>

      <DraggableItemPopup
        v-if="showDetail && selected"
        :id="`${CONTROL_ID}-detail`"
        v-model:show="showDetail"
        :title="detailTitle"
        :height="560"
        :width="400"
        :top="slotProps.top != null ? slotProps.top + 28 : undefined"
        :bottom="slotProps.bottom != null ? slotProps.bottom + 28 : undefined"
        :left="slotProps.left != null ? slotProps.left + 28 : undefined"
        :right="slotProps.right != null ? slotProps.right + 380 : undefined"
        :container-id="slotProps.containerId"
      >
        <div
          class="map-registry-control map-registry-control--detail"
          :aria-label="detailTitle"
        >
          <MapTabs
            v-model="detailTab"
            :items="detailTabItems"
          >
            <template #props>
              <div
                class="map-registry-control__layout map-registry-control__props-pane"
              >
                <pre class="map-registry-control__props">{{ propsJson }}</pre>
                <div class="map-registry-control__run">
                  <InputSelect
                    v-model="actionType"
                    :label="trans('map.registry-control.actionType')"
                    :items="actionTypeItems"
                    item-value="value"
                    item-text="text"
                  />
                  <MapControlButton
                    class="map-registry-control__btn"
                    variant="outlined"
                    size="small"
                    @click="run"
                  >
                    {{ trans('map.registry-control.runAction') }}
                  </MapControlButton>
                </div>
              </div>
            </template>
            <template #layout>
              <div class="map-registry-control__layout">
                <div class="map-registry-control__layout-fields">
                  <div class="map-registry-control__layout-span">
                    <InputCheckbox
                      v-model="layoutDraft.visible"
                      :label="trans('map.registry-control.layoutVisible')"
                    />
                  </div>
                  <div class="map-registry-control__layout-span">
                    <InputSelect
                      v-model="layoutDraft.position"
                      :label="trans('map.registry-control.layoutPosition')"
                      :items="positionItems"
                      item-value="value"
                      item-text="text"
                    />
                  </div>
                  <InputText
                    v-model.number="layoutDraft.order"
                    type="number"
                    :label="trans('map.registry-control.layoutOrder')"
                  />
                  <InputSelect
                    v-model="layoutDraft.controlLayout"
                    :label="trans('map.registry-control.layoutControlLayout')"
                    :items="controlLayoutItems"
                    item-value="value"
                    item-text="text"
                  />
                  <div class="map-registry-control__layout-span">
                    <InputSelect
                      v-model="layoutDraft.buttonInMobile"
                      :label="
                        trans('map.registry-control.layoutButtonInMobile')
                      "
                      :items="buttonInMobileItems"
                      item-value="value"
                      item-text="text"
                    />
                  </div>
                </div>
                <div class="map-registry-control__layout-footer">
                  <MapControlButton
                    class="map-registry-control__btn"
                    variant="outlined"
                    size="small"
                    @click="applyLayout"
                  >
                    {{ trans('map.registry-control.layoutApply') }}
                  </MapControlButton>
                </div>
              </div>
            </template>
            <template #panel>
              <div
                v-if="showPanelSection"
                class="map-registry-control__layout"
              >
                <div
                  v-if="selected?.panelKind === 'sidebar'"
                  class="map-registry-control__layout-fields"
                >
                  <div class="map-registry-control__layout-span">
                    <InputSelect
                      v-model="panelDraft.location"
                      :label="trans('map.registry-control.panelLocation')"
                      :items="locationItems"
                      item-value="value"
                      item-text="text"
                    />
                  </div>
                  <div class="map-registry-control__layout-span">
                    <InputCheckbox
                      v-model="panelDraft.open"
                      :label="trans('map.registry-control.panelShowState')"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="map-registry-control__layout-fields"
                >
                  <InputText
                    v-if="panelEdgeFields.top"
                    v-model="panelDraft.top"
                    type="number"
                    :label="trans('map.registry-control.panelTop')"
                  />
                  <InputText
                    v-if="panelEdgeFields.right"
                    v-model="panelDraft.right"
                    type="number"
                    :label="trans('map.registry-control.panelRight')"
                  />
                  <InputText
                    v-if="panelEdgeFields.bottom"
                    v-model="panelDraft.bottom"
                    type="number"
                    :label="trans('map.registry-control.panelBottom')"
                  />
                  <InputText
                    v-if="panelEdgeFields.left"
                    v-model="panelDraft.left"
                    type="number"
                    :label="trans('map.registry-control.panelLeft')"
                  />
                  <InputText
                    v-model="panelDraft.width"
                    type="number"
                    :label="trans('map.registry-control.panelWidth')"
                  />
                  <InputText
                    v-model="panelDraft.height"
                    type="number"
                    :label="trans('map.registry-control.panelHeight')"
                  />
                  <div class="map-registry-control__layout-span">
                    <InputCheckbox
                      v-model="panelDraft.open"
                      :label="trans('map.registry-control.panelShowState')"
                    />
                  </div>
                </div>
                <div class="map-registry-control__layout-footer">
                  <MapControlButton
                    class="map-registry-control__btn"
                    variant="outlined"
                    size="small"
                    @click="applyPanel"
                  >
                    {{ trans('map.registry-control.panelApply') }}
                  </MapControlButton>
                </div>
              </div>
            </template>
          </MapTabs>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
