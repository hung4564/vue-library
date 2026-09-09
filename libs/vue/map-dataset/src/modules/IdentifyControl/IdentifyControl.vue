<script lang="ts">
export default {
  name: 'InspectControl',
};
</script>

<script setup lang="ts">
import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import {
  EventBboxRanger,
  EventBboxRangerHandle,
  EventClick,
} from '@hungpvq/map-core/event';
import {
  MAP_CONTEXT_MENU_ID,
  type MapMenuItemProps,
} from '@hungpvq/map-core/menu';
import type { IdentifyMultiResult, IIdentifyView } from '@hungpvq/map-dataset/identify';
import { clearIdentifyScope, handleMultiIdentify, IDENTIFY_ALL_LAYERS_VALUE, IDENTIFY_CONTROL, IDENTIFY_CONTROL_LOCALE, IDENTIFY_RESULT_CONTROL, identifyResolver, type IdentifyLayerFilterPayload, type IdentifyResultUpdatePayload, type IdentifyScopeToggleResult } from '@hungpvq/map-dataset/identify';
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
import { loggerIdentify } from '../../logger';
import { useMapDataset } from '../../store';
import { useMapDatasetHighlight } from '../../store/highlight';
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
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(IDENTIFY_CONTROL_LOCALE);

const views = ref<Array<IIdentifyView>>([]);
/** Local layer filter for IdentifyControl only (not synced with layer-item). */
const filterIdentifyId = ref<string | undefined>();
const origin = reactive({ latitude: 0, longitude: 0 });
const show = ref(!!props.show);
const loading = ref(false);

function refreshViews() {
  views.value = (
    getAllComponentsByType<IIdentifyView>('identify') || []
  ).reverse();
}
watch(getDatasetIds(), refreshViews, { deep: true, immediate: true });

const cUsedIdentify = computed(() => {
  const id = filterIdentifyId.value;
  if (!id) return views.value;
  return views.value.filter((view) => view.id === id);
});
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

function setShow(value: boolean) {
  show.value = value;
}

function updateResultPanel(payload: IdentifyResultUpdatePayload) {
  UniversalRegistry.runControlAction(
    mapId.value,
    IDENTIFY_RESULT_CONTROL.id,
    IDENTIFY_RESULT_CONTROL.actionUpdate,
    payload,
  );
}

function buildLayerItems() {
  return [
    {
      value: IDENTIFY_ALL_LAYERS_VALUE,
      text: trans.value('map.identify.all_layers'),
    },
    ...views.value.map((view) => ({
      value: view.id,
      text: view.getName?.() || view.id,
    })),
  ];
}

function syncResultPanel(extra?: IdentifyResultUpdatePayload) {
  updateResultPanel({
    loading: loading.value,
    origin: { ...origin },
    layerItems: buildLayerItems(),
    selectedLayerId: filterIdentifyId.value ?? IDENTIFY_ALL_LAYERS_VALUE,
    isEventClickActive: isEventClickActive.value,
    isEventClickBox: isEventClickBox.value,
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
    setShow(value);
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
  if (result?.active && result.identifyId) {
    filterIdentifyId.value = result.identifyId;
    show.value = true;
    origin.latitude = 0;
    origin.longitude = 0;
    syncResultPanel({
      selectedLayerId: result.identifyId,
      items: [],
      loading: false,
      origin: { latitude: 0, longitude: 0 },
    });
    if (!isUseClick.value) onStartMapClick();
    return;
  }
  if (
    result?.identifyId &&
    filterIdentifyId.value &&
    filterIdentifyId.value === result.identifyId
  ) {
    filterIdentifyId.value = undefined;
    origin.latitude = 0;
    origin.longitude = 0;
    syncResultPanel({
      selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
      items: [],
      loading: false,
      origin: { latitude: 0, longitude: 0 },
    });
  }
  if (!props.immediately) onRemoveMapClick();
}

function onLayerFilterChange(identifyId: string) {
  const id =
    !identifyId || identifyId === IDENTIFY_ALL_LAYERS_VALUE
      ? undefined
      : identifyId;
  filterIdentifyId.value = id;
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
  origin.latitude = lat;
  origin.longitude = lng;
  onGetFeatures(event ?? ({ point, lngLat: { lng, lat } } as MapMouseEvent));
}

function onMapClick(e: MapMouseEvent) {
  if (isEventClickBox.value) return;
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
    'onMapClick',
    { event: e },
  );
  runIdentifyAt(e.lngLat.lng, e.lngLat.lat, e.point, e);
}

function onIdentifyHere(menuProps: MapMenuItemProps) {
  const { lng, lat } = menuProps.layer.lngLat;
  const point = menuProps.layer.point;
  if (point) {
    runIdentifyAt(lng, lat, point);
    return;
  }
  callMap((map) => {
    runIdentifyAt(lng, lat, map.project([lng, lat]));
  });
}

function onBboxSelect(bbox: Parameters<EventBboxRangerHandle>[0]) {
  if (isEventClickActive.value) return;
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
    'onBboxSelect',
    bbox,
  );
  onRemoveBox();
  if (!bbox) return;
  const bounds = new LngLatBounds([bbox[0].x, bbox[0].y, bbox[1].x, bbox[1].y]);
  show.value = true;
  onGetFeatures(bounds);
}

function onSelectFeatures(
  event?: MapMouseEvent,
  features: IdentifyMultiResult[] = [],
) {
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
    'onSelectFeatures',
    features,
  );
  identifyResolver
    .execute({
      records: features,
      mapId: mapId.value,
      event,
      singleLayer: !!filterIdentifyId.value,
      preferResultControl: !!props.preferResultControl,
    })
    .then((res) =>
      logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
        'onSelectFeaturesResult',
        res,
      ),
    );
}

async function onGetFeatures(e: MapMouseEvent | LngLatBounds) {
  let pointOrBox: PointLike | [PointLike, PointLike];
  if ('point' in e) {
    pointOrBox = e.point;
  } else {
    pointOrBox = e as unknown as [PointLike, PointLike];
  }

  const loadStartedAt = performance.now();
  loading.value = true;
  control.sync();
  callMap((map) => {
    map.getCanvas().style.cursor = 'wait';
  });
  // Keep panel spinner in sync if result panel is already open.
  syncResultPanel({ loading: true });
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').info(
    'loading:start',
    { pointOrBox },
  );
  let featureCount = 0;
  let hitCount = 0;
  try {
    logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
      'onGetFeatures',
      { pointOrBox, identifies: cUsedIdentify.value },
    );
    const features = await handleMultiIdentify(
      cUsedIdentify.value,
      mapId.value,
      pointOrBox,
    );
    logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
      'onGetFeatures',
      { features },
    );
    const nonEmpty = features.filter(
      (item): item is IdentifyMultiResult =>
        'features' in item && item.features.length > 0,
    );
    hitCount = nonEmpty.length;
    featureCount = nonEmpty.reduce(
      (sum, item) => sum + (item.features?.length ?? 0),
      0,
    );
    // Always run resolver so empty clears prior result-panel items.
    onSelectFeatures('point' in e ? e : undefined, nonEmpty);
  } finally {
    loading.value = false;
    control.sync();
    callMap((map) => {
      map.getCanvas().style.cursor = '';
    });
    syncResultPanel({ loading: false });
    logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').info(
      'loading:done',
      {
        durationMs: Math.round(performance.now() - loadStartedAt),
        hitCount,
        featureCount,
        empty: featureCount === 0,
      },
    );
  }
}

function toggleShow() {
  const next = !show.value;
  show.value = next;
  syncResultPanel({ show: next });
  if (next) {
    if (!isUseClick.value) onStartMapClick();
  } else {
    onRemoveIdentify();
  }
}

function close() {
  filterIdentifyId.value = undefined;
  clearIdentifyScope(mapId.value);
  onRemoveIdentify();
  setFeatureHighlight(undefined, 'identify');
  show.value = false;
  loading.value = false;
  origin.latitude = 0;
  origin.longitude = 0;
  syncResultPanel({
    show: false,
    loading: false,
    origin: { latitude: 0, longitude: 0 },
    selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
    items: [],
  });
}

/** Used by IdentifyShowFirstControl via actionSetLoading. */
function setIdentifyLoading(value: boolean) {
  loading.value = value;
  syncResultPanel({ loading: value });
  control.sync();
}

function onRemoveIdentify() {
  if (props.immediately) return;
  onRemoveMapClick();
  onRemoveBox();
}

const isUseClick = ref(false);
function onUseMapClick() {
  if (!isUseClick.value) onStartMapClick();
  else onRemoveMapClick();
}
function onStartMapClick() {
  isUseClick.value = true;
  addEventClick();
  syncResultPanel({ isEventClickActive: true });
}
function onRemoveMapClick() {
  isUseClick.value = false;
  removeEventClick();
  syncResultPanel({ isEventClickActive: false });
}

const isSelectBbox = ref(false);
function onUseBoxSelect() {
  if (!isSelectBbox.value) onStartBox();
  else onRemoveBox();
}
function onStartBox() {
  isSelectBbox.value = true;
  addEventBbox();
  syncResultPanel({ isEventClickBox: true });
}
function onRemoveBox() {
  isSelectBbox.value = false;
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
