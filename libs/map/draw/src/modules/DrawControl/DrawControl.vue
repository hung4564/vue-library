<script lang="ts">
export default {
  name: 'draw-control',
};
</script>
<script setup lang="ts">
import { ContextMenu } from '@hungpvq/content-menu';
import { fitBounds } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  EventClick,
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  useEventMap,
  useLang,
  useMap,
  useShow,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import MapboxDraw, {
  type DrawCreateEvent,
  type DrawDeleteEvent,
  type DrawUpdateEvent,
  type MapboxDrawOptions,
} from '@mapbox/mapbox-gl-draw';
import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveCheck,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiDraw,
  mdiPencil,
  mdiPlus,
  mdiUndoVariant,
  mdiViewListOutline,
} from '@mdi/js';
import { Feature, FeatureCollection } from 'geojson';
import { MapMouseEvent } from 'maplibre-gl';
import { computed, nextTick, ref } from 'vue';
import { DrawingTypeName } from '..';
import { isDraftOption, useConfigDrawControl } from '../../store';
import { IDraftRecord, MapDrawConfig, MapDrawOption } from '../../types';
import StaticMode from './models/static-mode';
import layers from './theme';
type DrawControlMapboxDrawControls = Omit<
  MapboxDrawOptions,
  'displayControlsDefault'
>;
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      drawOptions?: MapDrawOption;
      drawControlOptions?: DrawControlMapboxDrawControls;
    }
  >(),
  {
    ...defaultMapProps,
  },
);
const control = new MapboxDraw({
  displayControlsDefault: false,
  boxSelect: false,
  styles: layers,
  ...props.drawControlOptions,
  modes: {
    ...MapboxDraw.modes,
    static: StaticMode,
    ...props.drawControlOptions?.modes,
  },
});
const drawOptions = ref(props.drawOptions);
const draftItems = ref<IDraftRecord[]>([]);
const draftCounts = ref(0);
const { mapId, moduleContainerProps, callMap } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'draw-control': {
      draftList: {
        title: 'Draft items',
        field: {
          id: 'Id',
          type: 'Type',
          action: '#',
        },
        type: {
          created: 'Created',
          updated: 'Updated',
          deleted: 'Deleted',
        },
        action: {
          fillBound: 'Fill bound',
        },
      },
    },
  },
});
const isShow = ref(false);
function onStart(config: MapDrawOption) {
  isShow.value = true;
  drawOptions.value = props.drawOptions || config;
  drawSupport.value = drawOptions.value.drawSupports || [];
  callMap((map) => {
    map.on('draw.create', onDrawCreated);
    map.on('draw.update', onDrawUpdated);
    map.on('draw.delete', onDrawDeleted);
    if (!map.hasControl(control as any)) map.addControl(control as any);
  });
  onSelectMethod('select');
}
function close() {
  removeEventClick();
  isDraw.value = false;
  isShow.value = false;
  callMap((map) => {
    map.off('draw.create', onDrawCreated);
    map.off('draw.update', onDrawUpdated);
    map.off('draw.delete', onDrawDeleted);
    if (map.hasControl(control as any)) map.removeControl(control as any);
  });
}
const { setFeature, save, commit, discard } = useConfigDrawControl(
  mapId.value,
  {
    onStart,
    onEnd: close,
    onDiscard: () => {
      getCountDraftItem();
    },
    onCommit: () => {
      draftCounts.value = 0;
      draftItems.value = [];
    },
  },
);
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  new EventClick().setHandler(onMapClick),
);
function onDrawCreated(event: DrawCreateEvent) {
  for (const feature of event.features) {
    setFeature('added', feature);
  }
}
function onDrawUpdated(event: DrawUpdateEvent) {
  for (const feature of event.features) {
    setFeature('updated', feature);
  }
}
function onDrawDeleted(event: DrawDeleteEvent) {
  for (const feature of event.features) {
    setFeature('deleted', feature);
  }
  nextTick(() => {
    onSelectMethod('select');
  });
}
const path = {
  add: mdiPlus,
  delete: mdiDeleteOutline,
  update: mdiPencil,
  save: mdiContentSave,
  discard: mdiClose,
  close: mdiClose,
  draw: mdiDraw,
  draftCommit: mdiContentSaveCheck,
  draftDiscard: mdiUndoVariant,
  draftList: mdiViewListOutline,
  fillBound: mdiCrosshairsGps,
};
const method = ref('');
const current_feature = ref<Feature | undefined>(undefined);
function onSelectMethod(value: 'select' | 'delete') {
  removeEventClick();
  method.value = value;
  switch (value) {
    case 'select':
    case 'delete':
      addEventClick();
      control?.changeMode('static');
      break;
    default:
      break;
  }
}
function onDraw(type: string) {
  current_feature.value = undefined;
  control.changeMode(type);
  isDraw.value = true;
}
const drawSupport = ref<MapDrawConfig['drawSupports']>([]);
const isDraw = ref(false);
async function onSave() {
  onSelectMethod('select');
  isDraw.value = false;
  current_feature.value = undefined;
  await save(control.getAll() as FeatureCollection, getContext());
  await clearDraw();
  await redrawSource();
}
function getCountDraftItem() {
  if (!isDraftOption(drawOptions.value)) {
    return;
  }
  const action = drawOptions.value;
  draftItems.value = action.getDraftItems();
  draftCounts.value = draftItems.value.length;
}
function onCancel() {
  isDraw.value = false;
  const action = drawOptions.value;
  action?.cancel && action?.cancel(current_feature.value);
  clearDraw();
  redrawSource();
  current_feature.value = undefined;
}
async function redrawSource() {
  const action = drawOptions.value;
  if (!action) {
    return;
  }
  getCountDraftItem();
  if (!isDraftOption(drawOptions.value)) {
    return action.redraw && action.redraw(mapId.value);
  }
}
function clearDraw() {
  current_feature.value = undefined;
  if (drawOptions.value?.cleanAfterDone) {
    control?.deleteAll();
  }
  nextTick(() => {
    onSelectMethod('select');
  });
}
async function onCommit() {
  const action = drawOptions.value;
  await commit();
  return action?.redraw && action.redraw(mapId.value);
}
function onDiscard() {
  discard();
}
function onDiscardItem(item: IDraftRecord) {
  discard(item);
}
function getContext() {
  return { mapId: mapId.value };
}
async function onMapClick(e: MapMouseEvent) {
  const action = drawOptions.value;
  if (!action) {
    return;
  }
  const feature = await (action.selectFeature &&
    action.selectFeature(
      { point: [e.lngLat.lng, e.lngLat.lat] },
      getContext(),
    ));
  current_feature.value = feature;
  if (!feature) {
    return;
  }
  switch (method.value) {
    case 'select': {
      const feature_ids = control?.add({
        type: 'FeatureCollection',
        features: [feature],
      });

      if (feature_ids && feature_ids.length > 0) {
        isDraw.value = true;
        removeEventClick();
        control.changeMode('direct_select', {
          featureId: feature_ids[0],
        });
      }
      break;
    }

    case 'delete': {
      control?.delete(control.getSelectedIds());
      action.deleteFeature &&
        (await action.deleteFeature(feature, getContext()));
      await redrawSource();
      break;
    }
  }
}
const contextMenuRef = ref<
  | {
      open(event: MouseEvent): void;
      close(): void;
    }
  | undefined
>();
const drawSupportItem = computed(() => {
  return drawSupport.value.map((x) => {
    if (typeof x === 'string') {
      return { id: x, name: DrawingTypeName[x] || x };
    }
    return x;
  });
});
function closeContextMenu() {
  if (contextMenuRef.value) contextMenuRef.value.close();
}
function onStartDraw(e: MouseEvent) {
  removeEventClick();
  if (drawSupport.value.length > 1) {
    if (contextMenuRef.value) contextMenuRef.value.open(e);
    return;
  }
  onDraw(drawSupport.value[0]);
}
const [showListDraftItem, setShowListDraftItem] = useShow();
function onShowListDraftItem() {
  setShowListDraftItem(true);
}
function onFlyTo(value: Feature) {
  callMap((map) => {
    fitBounds(map, value);
  });
}
</script>
<template setup>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <div
        class="d-flex button-custom-container button-draw-container"
        v-if="drawOptions"
      >
        <template v-if="isShow">
          <MapControlGroupButton row v-if="isDraw">
            <MapControlButton @click="onCancel()">
              <SvgIcon :size="18" type="mdi" :path="path.discard" />
            </MapControlButton>
            <MapControlButton @click="onSave()">
              <SvgIcon :size="18" type="mdi" :path="path.save" />
            </MapControlButton>
          </MapControlGroupButton>
          <MapControlGroupButton row v-else>
            <MapControlButton @click="close()">
              <SvgIcon :size="18" type="mdi" :path="path.close" />
            </MapControlButton>
            <MapControlButton
              :active="method === 'create'"
              @click="onStartDraw"
            >
              <SvgIcon :size="18" type="mdi" :path="path.add" />
            </MapControlButton>
            <MapControlButton
              :active="method === 'select'"
              @click="onSelectMethod('select')"
            >
              <SvgIcon :size="18" type="mdi" :path="path.update" />
            </MapControlButton>
            <MapControlButton
              :active="method === 'delete'"
              @click="onSelectMethod('delete')"
            >
              <SvgIcon :size="18" type="mdi" :path="path.delete" />
            </MapControlButton>
          </MapControlGroupButton>
        </template>
        <MapControlGroupButton
          row
          v-if="isDraftOption(drawOptions) && drawOptions.draft.show"
        >
          <MapControlButton
            @click="onCommit()"
            :disabled="isDraw || draftCounts == 0"
          >
            <SvgIcon :size="18" type="mdi" :path="path.draftCommit" />
          </MapControlButton>
          <MapControlButton
            @click="onDiscard()"
            :disabled="isDraw || draftCounts == 0"
          >
            <SvgIcon :size="18" type="mdi" :path="path.draftDiscard" />
          </MapControlButton>
          <MapControlButton
            @click="onShowListDraftItem()"
            :disabled="draftCounts == 0"
          >
            <SvgIcon
              :size="18"
              type="mdi"
              :path="path.draftList"
              :disabled="draftCounts == 0"
            />
            <span
              class="draft-item-count-badge map-control-badge"
              v-if="draftCounts"
              >{{ draftCounts }}</span
            >
          </MapControlButton>
        </MapControlGroupButton>
      </div>
    </template>

    <ContextMenu ref="contextMenuRef">
      <ul class="context-menu">
        <li
          v-for="(option, index) in drawSupportItem"
          :key="index"
          @click.stop="
            onDraw(option.id);
            closeContextMenu();
          "
          class="context-menu__item"
        >
          <span v-html="option.name"></span>
        </li>
      </ul>
    </ContextMenu>

    <template #draggable="props">
      <DraggableItemPopup
        :height="400"
        :width="400"
        v-bind="props"
        v-model:show="showListDraftItem"
        :title="trans('map.draw-control.draftList.title')"
      >
        <table class="draft-items-table">
          <thead>
            <tr>
              <th class="table-col-id">
                {{ trans('map.draw-control.draftList.field.id') }}
              </th>
              <th class="table-col-type">
                {{ trans('map.draw-control.draftList.field.type') }}
              </th>
              <th class="table-col-action">
                {{ trans('map.draw-control.draftList.field.action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in draftItems" :key="item.id">
              <td :title="item.id + ''" class="table-col-id">{{ item.id }}</td>
              <td class="table-col-type">
                {{ trans('map.draw-control.draftList.type.' + item.status) }}
              </td>
              <td class="table-col-action">
                <BaseButton
                  type="button"
                  v-if="item.modified"
                  @click="onFlyTo(item.modified as any)"
                  class="menu-item"
                  :title="trans('map.draw-control.draftList.action.fillBound')"
                >
                  <SvgIcon
                    :size="16"
                    type="mdi"
                    :path="path.fillBound"
                    :title="
                      trans('map.draw-control.draftList.action.fillBound')
                    "
                  />
                </BaseButton>
                <BaseButton
                  type="button"
                  @click="onDiscardItem(item)"
                  class="menu-item"
                  :title="trans('map.draw-control.draftList.action.discard')"
                >
                  <SvgIcon
                    :size="16"
                    type="mdi"
                    :path="path.delete"
                    :title="trans('map.draw-control.draftList.action.discard')"
                  />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
<style scoped>
.button-draw-container {
  display: flex;
  gap: 4px;
}
.map-control-badge {
  position: absolute;
  top: -6px;
  right: 2px;
  padding: 2px 6px;
  font-size: 0.5rem;
  font-weight: bold;
  border-radius: 999px;
  min-width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.draft-item-count-badge {
  background: #004e98;
  color: white;
}
.draft-items-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.draft-items-table th,
.draft-items-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #ffffff30;
  text-align: left;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-items-table thead th {
  font-weight: bold;
}
.table-col-action {
  width: 64px;
}
.menu-item {
  cursor: pointer;
}
</style>
