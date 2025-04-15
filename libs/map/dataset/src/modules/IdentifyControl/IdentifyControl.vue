<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  EventBboxRanger,
  EventClick,
  MapControlButton,
  ModuleContainer,
  useCoordinate,
  useEventMap,
  useLang,
  useMap,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer, mdiHandPointingUp, mdiSelect } from '@mdi/js';
import { MapMouseEvent, type PointLike } from 'mapbox-gl';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { IDataset } from '../../interfaces/dataset.base';
import type { IIdentifyView, MenuAction } from '../../interfaces/dataset.parts';
import { getAllComponentsByType, getDatasetIds } from '../../store';
import { setFeatureHighlight } from '../../store/highlight';
import MenuItem from './menu/index.vue';
const path = {
  icon: mdiHandPointingUp,
  boxSelect: mdiSelect,
  mapClick: mdiCursorPointer,
};
const props = defineProps({
  ...withMapProps,
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocale } = useLang(mapId.value);
const { format: formatCoordinate } = useCoordinate(mapId.value);
setLocale({
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
const views = ref<Array<IIdentifyView & IDataset>>([]);
const currentIdentify = ref<IIdentifyView & IDataset>();
const datasetIds = computed(() => {
  return getDatasetIds(mapId.value).value;
});
watch(
  datasetIds,
  () => {
    updateList();
  },
  { deep: true }
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
  views.value =
    getAllComponentsByType<IIdentifyView & IDataset>(mapId.value, 'identify') ||
    [];
}
const hasViews = computed(() => {
  return views.value.length > 0;
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
} = useEventMap(
  mapId.value,
  (new EventBboxRanger() as any).setHandler(onBboxSelect)
);

const origin = reactive({ latitude: 0, longitude: 0 });
function onMapClick(e: MapMouseEvent) {
  origin.latitude = e.lngLat.lat;
  origin.longitude = e.lngLat.lng;
  onGetFeatures(e.point);
}
function onBboxSelect(bbox: any) {
  onRemoveBox();
  if (!bbox) return;
  onGetFeatures(bbox);
}
const result = reactive<{
  items: { identify: IIdentifyView & IDataset; features: any[] }[];
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
  features: { identify: IIdentifyView & IDataset; features: any[] }[]
) {
  result.items = features;
}
async function onGetFeatures(pointOrBox?: PointLike | [PointLike, PointLike]) {
  result.loading = true;
  try {
    const startTime = Date.now();
    const features = await Promise.all(
      cUsedIdentify.value.map((x) =>
        x
          .getFeatures(mapId.value, pointOrBox)
          .then((res) => ({
            identify: x,
            features: res,
          }))
          .catch((e) => {
            console.error(e);
            return {
              identify: x,
              features: [],
            };
          })
      )
    );
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime));
    }
    onSelectFeatures(features.filter((item) => item.features.length > 0));
  } finally {
    result.loading = false;
  }
}
const show = ref(false);
function toggleShow() {
  show.value = !show.value;
  onUseMapClick();
}
function close() {
  onRemoveIdentify();
  setFeatureHighlight(mapId.value, undefined, 'identify');
  onSelectFeatures([]);
}
function onRemoveIdentify() {
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
  removeEventBbox();
}

function onMenuAction(
  identify: IIdentifyView & IDataset,
  menu: MenuAction<IIdentifyView & IDataset>,
  item: any
) {
  if (menu.type != 'item' || !identify || !menu.click) {
    return;
  }
  menu.click(identify, mapId.value, item);
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        :tooltip="trans('map.identify.title')"
        @click.stop="toggleShow()"
        :active="show"
        v-if="hasViews"
      >
        <SvgIcon size="16" type="mdi" :path="path.icon" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        v-model:show="show"
        v-bind="props"
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
                :key="item.identify.id"
                class="identify-control-list-item"
              >
                <div class="identify-control-list-item__container">
                  <div
                    class="identify-control-list-item__header"
                    :title="item.identify.getName()"
                  >
                    {{ item.identify.getName() || '---' }}
                  </div>
                  <div class="identify-control-list-item__child-container">
                    <div
                      class="identify-control-child-item"
                      v-for="child in item.features"
                      :key="child.id"
                    >
                      <span>
                        {{ child.name }}
                      </span>
                      <div class="identify-control-child-item__spacer"></div>
                      <div class="identify-control-child-item__action">
                        <template
                          v-for="(menu, i) in item.identify.menus"
                          :key="i"
                        >
                          <MenuItem
                            class="layer-item__button"
                            :item="menu"
                            :data="child"
                            :mapId="mapId"
                            @click="
                              onMenuAction(item.identify, menu, child.data)
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
<style>
.boxdraw {
  border: dashed 2px black;
  background-color: #ffffff30;
}
</style>
<style scoped lang="scss">
.identify-control__button {
  display: inline-flex;
  min-width: 20px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.identify-control {
  &-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    b {
      color: var(--v-primary-base, #1a73e8);
      padding-right: 4px;
      font-weight: bolder;
    }
  }

  &-header {
    padding: 8px;
    width: 100%;
    flex-grow: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
  }

  &-separator {
    flex-grow: 0;
    display: block;
    flex: 1 1 0px;
    max-width: 100%;
    height: 0;
    max-height: 0;
    border: solid;
    border-width: thin 0 0 0;
  }

  &-body {
    flex-grow: 1;
    overflow: auto;
    padding: 16px;
  }

  &-list-item {
    // box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    //   0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    display: block;
    max-width: 100%;
    position: relative;
    padding: 4px;
    border: solid;
    border-width: thin;
    margin-bottom: 4px;

    &__header {
      color: var(--v-primary-base, #1a73e8);
      font-weight: bolder;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      font-size: 1rem !important;
      line-height: 1.75rem;
      letter-spacing: 0.009375em !important;
    }

    &__container {
      display: flex;
      letter-spacing: normal;
      min-height: 30px;
      outline: none;
      padding: 0 12px;
      position: relative;
      margin-top: 4px;
      flex-direction: column;
    }
    &__child-container {
      display: flex;
      letter-spacing: normal;
      min-height: 30px;
      outline: none;
      position: relative;
      margin-top: 4px;
      flex-direction: column;
      gap: 4px;
    }
  }

  &-child-item {
    flex-grow: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &__spacer {
      flex-grow: 1;
    }

    &__action {
      flex-grow: 0;
      flex-shrink: 0;

      .layer-item__button {
        display: inline-block;
        padding: 0 4px;
        cursor: pointer;
        background: transparent;
        outline: none;
        box-shadow: none;
        border: none;
        min-width: 25px;
      }
    }
  }
}
.identify-control-child-item {
  min-height: 30px;
  display: flex;
  align-items: center;
  border: solid;
  border-width: thin;
  padding: 8px;
}
.identify-control-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__loading {
    width: 24px;
    height: 24px;
    border: 2px solid var(--v-primary-base, #1a73e8);
    border-radius: 50%;
    border-right-color: transparent;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
