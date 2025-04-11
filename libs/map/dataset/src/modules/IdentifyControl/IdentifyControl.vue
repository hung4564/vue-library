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
import { MapMouseEvent, PointLike } from 'mapbox-gl';
import { computed, onMounted, reactive, ref } from 'vue';
import { IDataset } from '../../interfaces/dataset.base';
import type { IIdentifyView, MenuAction } from '../../interfaces/dataset.parts';
import { getAllComponentsByType } from '../../store';
import MenuItem from './menu/index.vue';
const path = {
  icon: mdiHandPointingUp,
  boxSelect: mdiSelect,
  mapClick: mdiCursorPointer,
};
const props = defineProps({
  ...withMapProps,
});
const { mapId, moduleContainerProps, callMap } = useMap(props);
const { trans, setLocale } = useLang(mapId.value);
const { format: formatCoordinate } = useCoordinate(mapId.value);
setLocale({
  map: {
    identify: {
      title: 'Identify',
      point: 'Point',
    },
  },
});
const views = ref<Array<IIdentifyView & IDataset>>([]);
const currentIdentify = ref<IIdentifyView & IDataset>();
onMounted(() => {
  updateList();
});

function updateList() {
  getViewFromStore();
  onSelectIdentify(views.value[0]);
}
function onSelectIdentify(identify: IIdentifyView & IDataset) {
  currentIdentify.value = identify;
}
const button_menus = computed<MenuAction<IIdentifyView & IDataset>[]>(() => {
  if (!currentIdentify.value) {
    return [];
  }
  return currentIdentify.value.menus;
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'extra')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
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
async function onGetFeatures(pointOrBox?: PointLike | [PointLike, PointLike]) {
  if (!currentIdentify.value) return;
  const features = await currentIdentify.value.getFeatures(
    mapId.value,
    pointOrBox
  );
  onSelectFeatures(features);
}
const show = ref(false);
function toggleShow() {
  show.value = !show.value;
  onUseMapClick();
}
function close() {
  onRemoveIdentify();
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

const result = reactive<{ items: any[]; loading: boolean }>({
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
function onSelectFeatures(features: any[]) {
  result.items = features;
}
function onMenuAction(menu: MenuAction<IIdentifyView & IDataset>, item: any) {
  if (menu.type != 'item' || !currentIdentify.value || !menu.click) {
    return;
  }
  menu.click(currentIdentify.value, mapId.value, item);
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
            <div
              v-for="item in result.items"
              :key="item.id"
              class="identify-control-list-item"
            >
              <div class="identify-control-list-item__container">
                <div class="identify-control-child-item" :title="item.name">
                  <span>
                    {{ item.name || '---' }}
                  </span>
                </div>
                <div class="identify-control-child-item__spacer"></div>
                <div class="identify-control-child-item__action">
                  <template v-for="(menu, i) in extra_menus" :key="i">
                    <MenuItem
                      class="layer-item__button"
                      :item="menu"
                      :data="item"
                      :mapId="mapId"
                      @click="onMenuAction(menu, item.data)"
                    />
                  </template>
                </div>
              </div>
            </div>
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
      align-items: center;
      display: flex;
      letter-spacing: normal;
      min-height: 30px;
      outline: none;
      padding: 0 12px;
      position: relative;
      margin-top: 4px;
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
</style>
