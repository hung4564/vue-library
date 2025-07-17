<script lang="ts">
export default {
  name: 'draw-control',
};
</script>
<script setup lang="ts">
import { ContextMenu } from '@hungpvq/content-menu';
import {
  defaultMapProps,
  EventClick,
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  useEventMap,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from '@mapbox/mapbox-gl-draw';
import {
  mdiClose,
  mdiContentSave,
  mdiDeleteOutline,
  mdiDraw,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';
import { MapMouseEvent } from 'maplibre-gl';
import { computed, ref, watch } from 'vue';
import { DrawingTypeName } from '..';
import { useMapDraw } from '../../store';
import type { DrawOption } from '../../types';
import layers from './theme';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      drawOptions?: DrawOption;
    }
  >(),
  {
    ...defaultMapProps,
    drawOptions: undefined,
  },
);
const drawOptions = props.drawOptions as DrawOption;
const { mapId, moduleContainerProps, callMap } = useMap(props);
const {
  initDrawControl,
  activateDraw,
  deactivateDraw,
  callDraw,
  cancelDraw,
  checkAndCallDone,
  draw,
  getDrawAction,
  getDrawControl,
  getDrawIsActivated,
  getDrawIsRegisterId,
  getDrawIsShow,
  getDrawSupport,
  saveDraw,
  setFeature,
} = useMapDraw(mapId.value);
const isShow = computed(() => {
  return getDrawIsShow();
});
watch(isShow, (newValue) => {
  callMap((map) => {
    if (newValue) {
      onSelectMethod('select');
      map.on('draw.create', onDrawCreated);
      map.on('draw.update', onDrawUpdated);
      map.on('draw.delete', onDrawDeleted);
      map.addControl(control as any);
    } else {
      map.off('draw.create', onDrawCreated);
      map.off('draw.update', onDrawUpdated);
      map.off('draw.delete', onDrawDeleted);
      map.removeControl(control as any);
    }
  });
});
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  new EventClick().setHandler(onMapClick),
);
let control = new MapboxDraw({
  displayControlsDefault: false,
  boxSelect: false,
  styles: layers,
});
function onDrawCreated(event: DrawCreateEvent) {
  for (const feature of event.features) {
    setFeature('added', feature);
  }
  checkAndCallDone(register_id.value!);
  onSelectMethod('select');
}
function onDrawUpdated(event: DrawUpdateEvent) {
  for (const feature of event.features) {
    setFeature('updated', feature);
  }
  checkAndCallDone(register_id.value!);
  onSelectMethod('select');
}
function onDrawDeleted(event: DrawDeleteEvent) {
  for (const feature of event.features) {
    setFeature('deleted', feature);
  }
  checkAndCallDone(register_id.value!);
  onSelectMethod('select');
}
initDrawControl(control);
const path = {
  add: mdiPlus,
  delete: mdiDeleteOutline,
  update: mdiPencil,
  save: mdiContentSave,
  discard: mdiClose,
  close: mdiClose,
  draw: mdiDraw,
};
const method = ref('');
function onSelectMethod(value: 'select' | 'delete' | 'create') {
  removeEventClick();
  method.value = value;
  switch (value) {
    case 'select':
    case 'delete':
      addEventClick();
      break;
    default:
      break;
  }
}
const register_id = computed(() => {
  return getDrawIsRegisterId();
});
function onDraw(type: string) {
  activateDraw(register_id.value!);
  draw(register_id.value!, type);
}
const isActivated = computed(() => {
  return getDrawIsActivated();
});
const drawSupport = computed(() => {
  return getDrawSupport();
});
const isDraw = computed(() => {
  return isActivated.value;
});
function onSave() {
  saveDraw(register_id.value!);
}
function onCancel() {
  cancelDraw();
}
function close() {
  deactivateDraw();
  removeEventClick();
}
async function onMapClick(e: MapMouseEvent) {
  const action = getDrawAction();
  const control = getDrawControl();
  const features =
    (await (action.getFeatures &&
      action.getFeatures([e.lngLat.lng, e.lngLat.lat]))) || [];
  switch (method.value) {
    case 'select': {
      const feature_ids = control?.add({ type: 'FeatureCollection', features });
      if (feature_ids && feature_ids.length > 0) {
        activateDraw(register_id.value!);
        draw(register_id.value!, 'direct_select', undefined, {
          featureId: feature_ids[0],
        });
      }
      break;
    }

    case 'delete': {
      control?.delete(control.getSelectedIds());
      action.deleteFeatures && action.deleteFeatures(features);
      action.reset && action.reset();
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
  if (drawSupport.value.length > 1) {
    if (contextMenuRef.value) contextMenuRef.value.open(e);
    return;
  }
  onSelectMethod('create');
  onDraw(drawSupport.value[0]);
}
function onInitDraw() {
  if (!drawOptions) {
    return;
  }
  callDraw(drawOptions);
}
</script>
<template setup>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <div class="d-flex button-custom-container" v-if="isShow">
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
          <MapControlButton :active="method === 'create'" @click="onStartDraw">
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
      </div>
      <div class="d-flex button-custom-container" v-else-if="drawOptions">
        <MapControlButton>
          <SvgIcon
            :size="18"
            type="mdi"
            :path="path.draw"
            @click="onInitDraw"
          />
        </MapControlButton>
      </div>
    </template>

    <ContextMenu ref="contextMenuRef">
      <ul class="context-menu">
        <li
          v-for="(option, index) in drawSupportItem"
          :key="index"
          @click.stop="
            onSelectMethod('create');
            onDraw(option.id);
            closeContextMenu();
          "
          class="context-menu__item"
        >
          <span v-html="option.name"></span>
        </li>
      </ul>
    </ContextMenu>
  </ModuleContainer>
</template>
