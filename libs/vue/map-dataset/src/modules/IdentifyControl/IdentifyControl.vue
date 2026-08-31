<script lang="ts">
export default {
  name: 'InspectControl',
};
</script>

<script setup lang="ts">
import {
  EventBboxRanger,
  EventBboxRangerHandle,
  EventClick,
  logHelper,
  type WithMapPropType,
} from '@hungpvq/map-core';
import type {
  IdentifyMultiResult,
  IIdentifyView,
  MenuAction,
} from '@hungpvq/map-dataset';
import { handleMenuAction, handleMultiIdentify } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useCoordinate,
  useEventMap,
  useLang,
  useMap,
  useToolbarControl,
  WithShowProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer, mdiHandPointingUp, mdiSelect } from '@mdi/js';
import { LngLatBounds, MapMouseEvent, type PointLike } from 'maplibre-gl';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { loggerIdentify } from '../../logger';
import { useMapDataset } from '../../store';
import { useMapDatasetHighlight } from '../../store/highlight';
import MenuItem from './menu/index.vue';

const path = {
  icon: mdiHandPointingUp,
  boxSelect: mdiSelect,
  mapClick: mdiCursorPointer,
};
const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        immediately?: boolean;
      }
  >(),
  { ...defaultMapProps },
);
const { mapId, moduleContainerProps, order } = useMap(props);
const { getAllComponentsByType, getDatasetIds } = useMapDataset(mapId.value);
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
const { format: formatCoordinate } = useCoordinate(mapId.value);
setLocaleDefault({
  map: {
    identify: {
      title: 'Identify',
      point: 'Point',
      no_selection: 'Please select a point on the map',
      no_data: 'No data found',
      loading: 'Loading...',
    },
  },
});
const views = ref<Array<IIdentifyView>>([]);
const datasetIds = computed(() => {
  return getDatasetIds().value;
});
watch(
  datasetIds,
  () => {
    updateList();
  },
  { deep: true },
);
onMounted(() => {
  updateList();
});
const cUsedIdentify = computed(() => {
  return views.value;
});
function updateList() {
  getViewFromStore();
}
function getViewFromStore() {
  views.value = (
    getAllComponentsByType<IIdentifyView>('identify') || []
  ).reverse();
}
const hasViews = computed(() => {
  return views.value.length > 0;
});
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

const origin = reactive({ latitude: 0, longitude: 0 });
function onMapClick(e: MapMouseEvent) {
  if (isEventClickBox.value) return;
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
    'onMapClick',
    { event: e },
  );
  origin.latitude = e.lngLat.lat;
  origin.longitude = e.lngLat.lng;
  onGetFeatures(e);
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
  onGetFeatures(bounds);
}
const result = reactive<{
  items: Grouped[];
  loading: boolean;
}>({
  items: [],
  loading: false,
});
const currentPoint = computed(() => {
  if (!origin) {
    return '';
  }
  const point = formatCoordinate(origin);
  return point.longitude + ', &nbsp;' + point.latitude;
});
const hasSelectedPoint = computed(() => {
  return origin.latitude !== 0 || origin.longitude !== 0;
});
function onSelectFeatures(
  event?: MapMouseEvent,
  features: IdentifyMultiResult[] = [],
) {
  logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
    'onSelectFeatures',
    features,
  );
  result.items = groupItems(features);
  if (
    props.immediately &&
    features &&
    features[0] &&
    features[0].features &&
    features[0].features[0]
  ) {
    const menu = features[0].identify.getMenu('show-detail');
    if (menu)
      onMenuAction(
        features[0].identify,
        menu,
        features[0].features[0].data,
        event,
      );
  }
}
async function onGetFeatures(e: MapMouseEvent | LngLatBounds) {
  let pointOrBox: PointLike | [PointLike, PointLike];
  if ('point' in e) {
    pointOrBox = e.point;
  } else {
    // Convert LngLatBounds to PointLike box
    // This assumes the map instance is available or handleMultiIdentify can handle bounds.
    // However, coordinate-to-point conversion needs the map.
    // For now, let's keep it as is if handleMultiIdentify handles unknown types loosely,
    // but better to cast specifically.
    pointOrBox = e as unknown as [PointLike, PointLike];
  }

  result.loading = true;
  try {
    logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
      'onGetFeatures',
      { pointOrBox, identifies: cUsedIdentify.value },
    );
    const startTime = Date.now();
    const features = await handleMultiIdentify(
      cUsedIdentify.value,
      mapId.value,
      pointOrBox,
    );
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime));
    }
    logHelper(loggerIdentify, mapId.value, 'MULTI', 'IdentifyControl').debug(
      'onGetFeatures',
      { features },
    );
    onSelectFeatures(
      'point' in e ? e : undefined,
      features.filter(
        (item): item is IdentifyMultiResult =>
          'features' in item && item.features.length > 0,
      ),
    );
  } finally {
    result.loading = false;
  }
}
const show = ref(props.show);
function toggleShow() {
  show.value = !show.value;
  onUseMapClick();
}
function close() {
  onRemoveIdentify();
  setFeatureHighlight(undefined, 'identify');
  onSelectFeatures(undefined, []);
}
function onRemoveIdentify() {
  if (props.immediately) {
    return;
  }
  onRemoveMapClick();
  onRemoveBox();
}

const isUseClick = ref(false);
function onUseMapClick() {
  if (!isUseClick.value) {
    onStartMapClick();
  } else {
    onRemoveMapClick();
  }
}
function onStartMapClick() {
  isUseClick.value = true;
  addEventClick();
}
function onRemoveMapClick() {
  isUseClick.value = false;
  removeEventClick();
}
const isSelectBbox = ref(false);
function onUseBoxSelect() {
  if (!isSelectBbox.value) {
    onStartBox();
  } else {
    onRemoveBox();
  }
}
function onStartBox() {
  isSelectBbox.value = true;
  addEventBbox();
}
function onRemoveBox() {
  isSelectBbox.value = false;
  setTimeout(() => {
    removeEventBbox();
  }, 500);
}

function onMenuAction(
  identify: IIdentifyView,
  menu: MenuAction,
  item: unknown,
  event?: MapMouseEvent | MouseEvent,
) {
  handleMenuAction(menu, {
    event,
    layer: identify,
    mapId: mapId.value,
    value: item,
  });
}
onMounted(() => {
  if (props.immediately) onUseMapClick();
});
interface Grouped {
  id: string;
  name: string;
  items: ({ id: string | number; name?: string; data: unknown } & {
    identify: IIdentifyView;
  })[];
}
function groupItems(items: IdentifyMultiResult[]): Grouped[] {
  const groups: Grouped[] = [];
  const groupExistingIds = new Map<string, Set<string | number>>();

  for (const item of items) {
    let group: Grouped | undefined;
    const groupIdentify = item.identify.group;
    if (groupIdentify) {
      group = groups.find((g) => g.id === groupIdentify.id);
      if (!group) {
        group = { id: groupIdentify.id, name: groupIdentify.name, items: [] };
        groups.push(group);
      }
    } else {
      group = {
        id: item.identify.id,
        name: item.identify.getName(),
        items: [],
      };
      groups.push(group);
    }
    let existingIds = groupExistingIds.get(group.id);
    if (!existingIds) {
      existingIds = new Set<string | number>();
      groupExistingIds.set(group.id, existingIds);
    }

    // gộp features + add identify
    for (const f of item.features) {
      const fid = f.id;

      if (!existingIds.has(fid)) {
        group.items.push({ ...f, identify: item.identify });
        existingIds.add(fid);
      }
    }
  }
  return groups;
}
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapIdentifyControl',
  getState() {
    return {
      visible: hasViews.value,
      active: show.value,
      title: trans.value('map.identify.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});
watch(show, () => control.sync());
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

    <template #draggable="p">
      <DraggableItemPopup
        v-if="show"
        v-model:show="show"
        v-bind="p"
        :width="400"
        :height="300"
        @close="close"
        :title="trans('map.identify.title')"
      >
        <template #extra-btn>
          <BaseButton
            @click.stop="onUseMapClick()"
            :active="isEventClickActive"
            :disabled="isEventClickActive"
          >
            <SvgIcon size="16" type="mdi" :path="path.mapClick" />
          </BaseButton>
          <BaseButton
            @click.stop="onUseBoxSelect()"
            :active="isEventClickBox"
            :disabled="isEventClickBox"
          >
            <SvgIcon size="16" type="mdi" :path="path.boxSelect" />
          </BaseButton>
        </template>
        <div class="identify-control-container">
          <div class="identify-control-header">
            <b>{{ trans('map.identify.point') }}:</b>
            <span v-html="currentPoint"> </span>
          </div>
          <hr class="identify-control-separator" />
          <div class="identify-control-body">
            <!-- Loading state -->
            <div v-if="result.loading" class="identify-control-state">
              <div class="identify-control-state__content">
                <div class="identify-control-state__loading"></div>
                <span>{{ trans('map.identify.loading') }}</span>
              </div>
            </div>
            <!-- No selection state -->
            <div v-else-if="!hasSelectedPoint" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{ trans('map.identify.no_selection') }}</span>
              </div>
            </div>

            <!-- Empty result state -->
            <div
              v-else-if="result.items.length === 0"
              class="identify-control-state"
            >
              <div class="identify-control-state__content">
                <span>{{ trans('map.identify.no_data') }}</span>
              </div>
            </div>

            <!-- Results list -->
            <template v-else>
              <div
                v-for="item in result.items"
                :key="item.id"
                class="identify-control-list-item"
              >
                <div class="identify-control-list-item__container">
                  <div
                    class="identify-control-list-item__header"
                    :title="item.name"
                  >
                    {{ item.name || '---' }}
                  </div>
                  <div class="identify-control-list-item__child-container">
                    <div
                      class="identify-control-child-item"
                      v-for="child in item.items"
                      :key="child.id"
                      :title="child.name"
                    >
                      <span class="identify-control-child-item__name">
                        {{ child.name }}
                      </span>
                      <div class="identify-control-child-item__spacer"></div>
                      <div class="identify-control-child-item__action">
                        <template
                          v-for="(menu, i) in child.identify.getMenus()"
                          :key="i"
                        >
                          <MenuItem
                            :item="menu"
                            @click="
                              onMenuAction(
                                child.identify,
                                menu,
                                child.data,
                                $event,
                              )
                            "
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
