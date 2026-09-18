<script lang="ts">
export default {
  name: 'IdentifyControl',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import {
  EventBboxRanger,
  EventClick,
} from '@hungpvq/map-core/event';
import {
  MAP_CONTEXT_MENU_ID,
  type MapMenuItemProps,
} from '@hungpvq/map-core/menu';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  createIdentifySession,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  type IdentifyLayerFilterPayload,
  type IdentifyResultUpdatePayload,
  type IdentifyScopeToggleResult,
  type IdentifySession,
} from '@hungpvq/map-dataset/identify';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  UniversalRegistry,
  useEventMap,
  useLang,
  useMap,
  useRegisterMapControl,
  useToolbarControl,
  type WithShowProps,
} from '@hungpvq/vue-map-core';
import { mdiHandPointingUp } from '@mdi/js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMapDataset } from '../../store/dataset-api';
import { useMapHighlight } from '../../store/highlight';
import IdentifyResultControl from './IdentifyResultControl.vue';

const path = {
  icon: mdiHandPointingUp,
};
const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        immediately?: boolean;
        /**
         * Always open Identify Result panel (skip auto show-detail / attribute-table),
         * even when those menus are registered.
         */
        preferResultControl?: boolean;
      }
  >(),
  { ...defaultMapProps, preferResultControl: false },
);
const { mapId, moduleContainerProps, order, callMap } = useMap(props);
const { getAllComponentsByType, getDatasetIds } = useMapDataset(mapId.value);
const hl = useMapHighlight(mapId.value);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', IDENTIFY_CONTROL_LOCALE);

const views = ref<Array<IIdentifyView>>([]);
const show = ref(!!props.show);
const loading = ref(false);

let session!: IdentifySession;
let syncResultPanelRef: (extra?: IdentifyResultUpdatePayload) => void = () =>
  undefined;
let controlSyncRef: () => void = () => undefined;

const {
  add: addEventClick,
  remove: removeEventClick,
  isActive: isEventClickActive,
} = useEventMap(
  mapId.value,
  new EventClick().setHandler((e) => session.onMapClick(e)),
);
const {
  add: addEventBbox,
  remove: removeEventBbox,
  isActive: isEventClickBox,
} = useEventMap(
  mapId.value,
  new EventBboxRanger().setHandler((bbox) => session.onBboxSelected(bbox)),
);

function updateResultPanel(payload: IdentifyResultUpdatePayload) {
  UniversalRegistry.runControlAction(
    mapId.value,
    IDENTIFY_RESULT_CONTROL.id,
    IDENTIFY_RESULT_CONTROL.actionUpdate,
    payload,
  );
}

session = createIdentifySession({
  mapId: mapId.value,
  getIdentifies: () => views.value,
  preferResultControl: !!props.preferResultControl,
  immediately: () => !!props.immediately,
  callMap,
  translateAllLayers: () => trans.value('map.identify.all_layers'),
  onStateChange: () => {
    syncFromModel();
    controlSyncRef();
  },
  setCursor: (cursor) => {
    callMap((map) => {
      map.getCanvas().style.cursor = cursor;
    });
  },
  syncResultPanel: (extra) => syncResultPanelRef(extra),
  onEventClickActive: (active) => {
    if (active) addEventClick();
    else removeEventClick();
  },
  onEventBoxSelectActive: (active) => {
    if (active) addEventBbox();
    else removeEventBbox();
  },
  onCloseSideEffects: () => {
    hl.hideIfSource('identify');
  },
});

if (props.show) session.setShow(true);

function syncFromModel() {
  const s = session.getState();
  show.value = s.show;
  loading.value = s.loading;
}

function syncResultPanel(extra?: IdentifyResultUpdatePayload) {
  updateResultPanel(session.buildResultPanelPayload(extra));
}
syncResultPanelRef = syncResultPanel;

function refreshViews() {
  views.value = (
    getAllComponentsByType<IIdentifyView>('identify') || []
  ).reverse();
}
watch(getDatasetIds(), refreshViews, { deep: true, immediate: true });

const hasViews = computed(() => views.value.length > 0);
watch(hasViews, () => {
  control.sync();
});

useRegisterMapControl(mapId, {
  id: IDENTIFY_CONTROL.id,
  panelKind: 'button',
  title: () => trans.value('map.identify.title'),
  buttonPosition: () => props.position,
  show,
  setShow: (value) => {
    session.setShow(value);
    syncFromModel();
    updateResultPanel({ show: value });
  },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    immediately: props.immediately,
    preferResultControl: props.preferResultControl,
  }),
  actions: [
    {
      type: IDENTIFY_CONTROL.id,
      run: () => {
        const resolved = session.toggleShow();
        syncFromModel();
        session.applyToggleShowEffects(resolved);
      },
    },
    {
      type: IDENTIFY_CONTROL.actionSetScoped,
      run: (event) => {
        const resolved = session.applyScopedSession(
          event as IdentifyScopeToggleResult | undefined,
        );
        syncFromModel();
        session.finishScopedSession(resolved);
      },
    },
    {
      type: IDENTIFY_CONTROL.actionUseMapClick,
      run: () => session.toggleMapClickMode(),
    },
    {
      type: IDENTIFY_CONTROL.actionUseBoxSelect,
      run: () => session.toggleBoxSelectMode(),
    },
    {
      type: IDENTIFY_CONTROL.actionSetLayerFilter,
      run: (event) => {
        const payload = event as IdentifyLayerFilterPayload | undefined;
        void session.applyLayerFilter(payload?.identifyId ?? '');
      },
    },
    {
      type: IDENTIFY_CONTROL.actionClose,
      run: () => {
        session.closeAndCleanup();
        syncFromModel();
      },
    },
    {
      type: IDENTIFY_CONTROL.actionSetLoading,
      run: (event) => {
        session.setLoading(!!event);
        syncFromModel();
        control.sync();
      },
    },
  ],
});

function onIdentifyHere(menuProps: MapMenuItemProps) {
  const { lng, lat } = menuProps.layer.lngLat;
  const point = menuProps.layer.point;
  session.onIdentifyHere(
    lng,
    lat,
    point ? [point.x, point.y] : undefined,
  );
}

onMounted(() => {
  if (props.immediately) session.toggleMapClickMode();
  syncResultPanel();
});
onUnmounted(() => {
  session.teardownInputModes({ immediate: true });
  session.destroy();
  UniversalRegistry.unregisterMenuHandlerForMap(
    mapId.value,
    MAP_CONTEXT_MENU_ID.identifyHere,
  );
});
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  MAP_CONTEXT_MENU_ID.identifyHere,
  onIdentifyHere,
);

watch(views, () => syncResultPanel(), { deep: true });
watch([isEventClickActive, isEventClickBox], () => syncResultPanel());

const { state, control } = useToolbarControl(mapId.value, props, {
  kind: 'single',
  id: IDENTIFY_CONTROL.id,
  getState() {
    return mdiButtonState(path.icon, {
      visible: hasViews.value,
      active: show.value,
      loading: loading.value,
      title: trans.value('map.identify.title'),
      order: order.value,
    });
  },
  onClick() {
    const resolved = session.toggleShow();
    syncFromModel();
    session.applyToggleShowEffects(resolved);
  },
});
controlSyncRef = () => control.sync();
watch([show, loading], () => control.sync());
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>
  </ModuleContainer>
  <IdentifyResultControl
    :position="props.position"
    :control-layout="props.controlLayout"
  />
</template>
