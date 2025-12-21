<script lang="ts">
export default {
  name: 'draw-control',
};
</script>
<script setup lang="ts">
import { ContextMenu } from '@hungpvq/content-menu';
import { fitBounds } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  ModuleContainer,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import MapboxDraw, { MapboxDrawOptions } from '@mapbox/mapbox-gl-draw';
import { Feature, FeatureCollection } from 'geojson';
import { computed, nextTick, ref } from 'vue';
import { DrawingTypeName } from '..';
import { isDraftOption } from '../../store';
import { MapDrawConfig, MapDrawOption } from '../../types';
import DrawDraftList from './components/DrawDraftList.vue';
import DrawToolbar from './components/DrawToolbar.vue';
import { useDrawDrafts } from './hooks/useDrawDrafts';
import { useDrawEvents } from './hooks/useDrawEvents';
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
const { mapId, moduleContainerProps, callMap } = useMap(props);
const { setLocaleDefault } = useLang(mapId.value);
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

const {
  draftItems,
  draftCounts,
  showListDraftItem,
  getCountDraftItem,
  onCommit,
  onDiscard,
  onDiscardItem,
  onShowListDraftItem,
  save,
} = useDrawDrafts(mapId.value, drawOptions, {
  onStart,
  onEnd: close,
});

const {
  onDrawCreated,
  onDrawUpdated,
  onDrawDeleted,
  addEventClick,
  removeEventClick,
  current_feature,
  isDraw,
  method,
} = useDrawEvents(mapId.value, control, drawOptions, {
  onSelectMethod,
  redrawSource,
  getContext,
});

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

async function onSave() {
  onSelectMethod('select');
  isDraw.value = false;
  current_feature.value = undefined;
  await save(control.getAll() as FeatureCollection, getContext());
  await clearDraw();
  await redrawSource();
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

function getContext() {
  return { mapId: mapId.value };
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

function onFlyTo(value: Feature) {
  callMap((map) => {
    fitBounds(map, value);
  });
}
</script>
<template setup>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <DrawToolbar
        :drawOptions="drawOptions"
        :isShow="isShow"
        :isDraw="isDraw"
        :method="method"
        :draftCounts="draftCounts"
        @cancel="onCancel"
        @save="onSave"
        @close="close"
        @start-draw="onStartDraw"
        @select-method="onSelectMethod"
        @commit="onCommit"
        @discard="onDiscard"
        @show-list="onShowListDraftItem"
      />
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
      <DrawDraftList
        v-bind="props"
        v-model:show="showListDraftItem"
        :draftItems="draftItems"
        :mapId="mapId"
        @fly-to="onFlyTo"
        @discard-item="onDiscardItem"
      />
    </template>
  </ModuleContainer>
</template>
