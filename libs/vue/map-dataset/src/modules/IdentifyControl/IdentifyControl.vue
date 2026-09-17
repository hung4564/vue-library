<script lang="ts">
export default {
  name: 'IdentifyControl',
};
</script>

<script setup lang="ts">
import { bindMapLongPress, type WithMapPropType } from '@hungpvq/map-core';
import {
  EventBboxRanger,
  EventBboxRangerHandle,
  EventClick,
} from '@hungpvq/map-core/event';
import {
  MAP_CONTEXT_MENU_ID,
  type MapMenuItemProps,
} from '@hungpvq/map-core/menu';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  buildIdentifyResultPanelBase,
  clearIdentifyScope,
  createIdentifyControlModel,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  shouldBindIdentifyLongPress,
  type IdentifyLayerFilterPayload,
  type IdentifyResultUpdatePayload,
  type IdentifyScopeToggleResult,
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
import { LngLatBounds, MapMouseEvent, type PointLike } from 'maplibre-gl';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
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

const model = createIdentifyControlModel({ show: !!props.show });

const views = ref<Array<IIdentifyView>>([]);
/** Local layer filter for IdentifyControl only (not synced with layer-item). */
const filterIdentifyId = ref<string | undefined>(
  model.getState().filterIdentifyId,
);
const origin = reactive({ ...model.getState().origin });
const show = ref(model.getState().show);
const loading = ref(model.getState().loading);
const isUseClick = ref(model.getState().isUseClick);
const isSelectBbox = ref(model.getState().isSelectBbox);

function syncFromModel() {
  const s = model.getState();
  show.value = s.show;
  loading.value = s.loading;
  filterIdentifyId.value = s.filterIdentifyId;
  origin.latitude = s.origin.latitude;
  origin.longitude = s.origin.longitude;
  isUseClick.value = s.isUseClick;
  isSelectBbox.value = s.isSelectBbox;
}

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

const {
  add: addEventClick,
  remove: removeEventClick,
  isActive: isEventClickActive,
} = useEventMap(mapId.value, new EventClick().setHandler(onMapClick));
const {
  add: addEventBbox,
  remove: removeEventBbox,
  isActive: isEventClickBox,
} = useEventMap(mapId.value, new EventBboxRanger().setHandler(onBboxSelect));

function updateResultPanel(payload: IdentifyResultUpdatePayload) {
  UniversalRegistry.runControlAction(
    mapId.value,
    IDENTIFY_RESULT_CONTROL.id,
    IDENTIFY_RESULT_CONTROL.actionUpdate,
    payload,
  );
}

function syncResultPanel(extra?: IdentifyResultUpdatePayload) {
  updateResultPanel({
    ...buildIdentifyResultPanelBase({
      loading: loading.value,
      origin: { ...origin },
      views: views.value,
      allLayersText: trans.value('map.identify.all_layers'),
      selectedLayerId: filterIdentifyId.value,
      isEventClickActive: isEventClickActive.value,
      isEventClickBox: isEventClickBox.value,
    }),
    ...extra,
  });
}

useRegisterMapControl(mapId, {
  id: IDENTIFY_CONTROL.id,
  panelKind: 'button',
  title: () => trans.value('map.identify.title'),
  buttonPosition: () => props.position,
  show,
  setShow: (value) => {
    model.setShow(value);
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
        toggleShow();
      },
    },
    {
      type: IDENTIFY_CONTROL.actionSetScoped,
      run: (event) => {
        applyScopedSession(event as IdentifyScopeToggleResult | undefined);
      },
    },
    {
      type: IDENTIFY_CONTROL.actionUseMapClick,
      run: () => onUseMapClick(),
    },
    {
      type: IDENTIFY_CONTROL.actionUseBoxSelect,
      run: () => onUseBoxSelect(),
    },
    {
      type: IDENTIFY_CONTROL.actionSetLayerFilter,
      run: (event) => {
        const payload = event as IdentifyLayerFilterPayload | undefined;
        onLayerFilterChange(payload?.identifyId ?? '');
      },
    },
    {
      type: IDENTIFY_CONTROL.actionClose,
      run: () => close(),
    },
    {
      type: IDENTIFY_CONTROL.actionSetLoading,
      run: (event) => {
        setIdentifyLoading(!!event);
      },
    },
  ],
});

/** One-way from layer-item: start identify + filter; do not open result popup. */
function applyScopedSession(result?: IdentifyScopeToggleResult) {
  const resolved = model.applyScopedSession(result);
  syncFromModel();
  if (resolved.kind === 'activate') {
    syncResultPanel(resolved.panel);
    if (resolved.startMapClick) onStartMapClick();
    return;
  }
  if (resolved.kind === 'clear-matching') {
    syncResultPanel(resolved.panel);
  }
  if (!props.immediately) onRemoveMapClick();
}

function onLayerFilterChange(identifyId: string) {
  const id = resolveIdentifyLayerFilterId(identifyId);
  model.setFilterIdentifyId(id);
  syncFromModel();
  syncResultPanel({
    selectedLayerId: id ?? IDENTIFY_ALL_LAYERS_VALUE,
  });
  // Keep map highlight + last click; re-query with the new layer filter.
  if (origin.latitude !== 0 || origin.longitude !== 0) {
    callMap((map) => {
      const point = map.project([origin.longitude, origin.latitude]);
      onGetFeatures({
        point,
        lngLat: { lng: origin.longitude, lat: origin.latitude },
      } as MapMouseEvent);
    });
  }
}

function runIdentifyAt(
  lng: number,
  lat: number,
  point: PointLike,
  event?: MapMouseEvent,
) {
  model.setOrigin(lat, lng);
  syncFromModel();
  onGetFeatures(event ?? ({ point, lngLat: { lng, lat } } as MapMouseEvent));
}

function onMapClick(e: MapMouseEvent) {
  if (isEventClickBox.value) return;
  runIdentifyAt(e.lngLat.lng, e.lngLat.lat, e.point, e);
}

function onIdentifyHere(menuProps: MapMenuItemProps) {
  const { lng, lat } = menuProps.layer.lngLat;
  const point = menuProps.layer.point;
  if (point) {
    runIdentifyAt(lng, lat, [point.x, point.y]);
    return;
  }
  callMap((map) => {
    runIdentifyAt(lng, lat, map.project([lng, lat]));
  });
}

function onBboxSelect(bbox: Parameters<EventBboxRangerHandle>[0]) {
  if (isEventClickActive.value) return;
  onRemoveBox();
  if (!bbox) return;
  const bounds = new LngLatBounds([bbox[0].x, bbox[0].y, bbox[1].x, bbox[1].y]);
  model.setShow(true);
  syncFromModel();
  onGetFeatures(bounds);
}

async function onGetFeatures(e: MapMouseEvent | LngLatBounds) {
  let pointOrBox: PointLike | [PointLike, PointLike];
  if ('point' in e) {
    pointOrBox = e.point;
  } else {
    pointOrBox = e as unknown as [PointLike, PointLike];
  }

  model.setLoading(true);
  syncFromModel();
  control.sync();
  callMap((map) => {
    map.getCanvas().style.cursor = 'wait';
  });
  // Keep panel spinner in sync if result panel is already open.
  syncResultPanel({ loading: true });
  try {
    await runIdentifyMulti({
      identifies: views.value,
      mapId: mapId.value,
      pointOrBox,
      event: 'point' in e ? e : undefined,
      filterIdentifyId: filterIdentifyId.value,
      preferResultControl: !!props.preferResultControl,
    });
  } finally {
    model.setLoading(false);
    syncFromModel();
    control.sync();
    callMap((map) => {
      map.getCanvas().style.cursor = '';
    });
    syncResultPanel({ loading: false });
  }
}

function toggleShow() {
  const resolved = model.toggleShow();
  syncFromModel();
  syncResultPanel(resolved.panel);
  if (resolved.startMapClick) onStartMapClick();
  else if (resolved.removeIdentify) onRemoveIdentify();
}

function close() {
  const closed = model.close();
  syncFromModel();
  clearIdentifyScope(mapId.value);
  onRemoveIdentify();
  hl.hideIfSource('identify');
  syncResultPanel(closed.panel);
}

/** Used by IdentifyShowFirstControl via actionSetLoading. */
function setIdentifyLoading(value: boolean) {
  model.setLoading(value);
  syncFromModel();
  syncResultPanel({ loading: value });
  control.sync();
}

function onRemoveIdentify() {
  if (props.immediately) return;
  onRemoveMapClick();
  onRemoveBox();
}

let unbindLongPress: (() => void) | null = null;
function onUseMapClick() {
  if (!isUseClick.value) onStartMapClick();
  else onRemoveMapClick();
}
function onStartMapClick() {
  model.setUseClick(true);
  syncFromModel();
  addEventClick();
  syncResultPanel({ isEventClickActive: true });
  unbindLongPress?.();
  unbindLongPress = null;
  if (shouldBindIdentifyLongPress()) {
    callMap((map) => {
      unbindLongPress = bindMapLongPress(map, {
        onLongPress: (point) => {
          if (isEventClickBox.value) return;
          const lngLat = map.unproject([point.x, point.y]);
          runIdentifyAt(lngLat.lng, lngLat.lat, [point.x, point.y]);
        },
      });
    });
  }
}
function onRemoveMapClick() {
  model.setUseClick(false);
  syncFromModel();
  removeEventClick();
  unbindLongPress?.();
  unbindLongPress = null;
  syncResultPanel({ isEventClickActive: false });
}

function onUseBoxSelect() {
  if (!isSelectBbox.value) onStartBox();
  else onRemoveBox();
}
function onStartBox() {
  model.setSelectBbox(true);
  syncFromModel();
  addEventBbox();
  syncResultPanel({ isEventClickBox: true });
}
function onRemoveBox() {
  model.setSelectBbox(false);
  syncFromModel();
  setTimeout(() => {
    removeEventBbox();
    syncResultPanel({ isEventClickBox: false });
  }, 500);
}

onMounted(() => {
  if (props.immediately) onUseMapClick();
  syncResultPanel();
});
onUnmounted(() => {
  onRemoveIdentify();
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
    toggleShow();
  },
});
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
