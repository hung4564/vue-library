<script setup lang="ts">
import { DraggableItemPopup } from '@hungpv97/vue-draggable';
import {
  BaseButton,
  EventBboxRanger,
  EventClick,
  ILayerIdentifyView,
  MapControlButton,
  ModuleContainer,
  useCoordinate,
  useEventMap,
  useLang,
  useMap,
  withMapProps,
} from '@hungpv97/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer, mdiHandPointingUp, mdiSelect } from '@mdi/js';
import { MapMouseEvent } from 'mapbox-gl';
import { computed, reactive, ref } from 'vue';
import { getLayerFromView } from '../../helper';
import { getAllLayersByView } from '../../store';
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

const views = computed<ILayerIdentifyView[]>(() => {
  return getAllLayersByView<ILayerIdentifyView>(mapId.value, 'identify');
});
const hasViews = computed(() => {
  return views.value.length > 0;
});
const idLayersMapping = computed(() => {
  return views.value.reduce<Record<string, ILayerIdentifyView>>((acc, view) => {
    let layer = getLayerFromView(view);
    if (!layer) {
      return acc;
    }
    let view_layer = layer.getView('map');
    if (!view_layer) {
      return acc;
    }
    let layer_ids = view_layer.getAllLayerIds();
    layer_ids.forEach((layer_id: string) => {
      acc[layer_id] = view;
    });
    return acc;
  }, {});
});
const allLayerIds = computed(() => Object.keys(idLayersMapping.value));
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
  callMap((map) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: allLayerIds.value,
    });
    onSelectFeatures(features);
  });
}
function onBboxSelect(bbox: any) {
  onRemoveBox();
  if (!bbox) return;
  onMapBbox(bbox);
}
function onMapBbox(bbox: any) {
  if (!bbox) return;
  callMap((map) => {
    const features = map.queryRenderedFeatures(bbox, {
      layers: allLayerIds.value,
    });
    onSelectFeatures(features);
  });
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
  result.items = [];
  let res = features.reduce((acc, cur) => {
    let layer_map = cur.layer;
    let layer_view = idLayersMapping.value[layer_map.id];
    if (!layer_view) {
      return acc;
    }
    let field_id = layer_view.config.field_id || 'id';
    let field_name = layer_view.config.field_name || 'name';
    if (!acc[layer_view.id]) {
      acc[layer_view.id] = {
        name: layer_view.name,
        view: layer_view,
        children: {},
        field_name,
      };
    }
    acc[layer_view.id].children[cur.properties[field_id]] = {
      id: cur.properties[field_id],
      name: cur.properties[field_name],
      data: Object.assign(
        {
          geometry: cur.geometry,
        },
        cur.properties
      ),
    };
    return acc;
  }, {});
  result.items = Object.keys(res).map((key) => res[key]);
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
        <SvgIcon size="14" type="mdi" :path="path.icon" />
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
            <SvgIcon size="14" type="mdi" :path="path.mapClick" />
          </BaseButton>
          <BaseButton
            @click.stop="onUseBoxSelect()"
            :active="isEventClickBox"
            :disabled="isEventClickBox"
          >
            <SvgIcon size="14" type="mdi" :path="path.boxSelect" />
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
              :key="item.view.id"
              class="identify-control-list-item"
            >
              <div class="identify-control-list-item__header">
                {{ item.name }}
              </div>
              <div class="identify-control-list-item__container">
                <div
                  class="identify-control-child-item"
                  v-for="child in item.children"
                  :key="child.id"
                >
                  <span>
                    {{ child.name }}
                  </span>
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
}
</style>
