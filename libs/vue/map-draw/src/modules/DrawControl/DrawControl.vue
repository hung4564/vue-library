<script lang="ts">
export type { DrawControlProps } from './DrawControl.props';

export default {
  name: 'draw-control',
};
</script>
<script setup lang="ts">
import { fitBounds } from '@hungpvq/map-core';
import {
  DrawingTypeName,
  createMapDrawControl,
  type MapDrawConfig,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { ContextMenu } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  useMap,
  useToolbarControl,
} from '@hungpvq/vue-map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import type { Feature, FeatureCollection } from 'geojson';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { isDraftOption } from '@hungpvq/map-draw';
import { useEnsureDrawBuiltinLocales } from '../../extra/lang/ensure-builtin-locales';
import DrawDraftList from './components/DrawDraftList.vue';
import DrawToolbar from './components/DrawToolbar.vue';
import { useDrawDrafts } from './hooks/useDrawDrafts';
import { useDrawEvents } from './hooks/useDrawEvents';
import type { DrawControlProps } from './DrawControl.props';
import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveCheck,
  mdiDeleteOutline,
  mdiPencil,
  mdiPlus,
  mdiUndoVariant,
  mdiViewListOutline,
} from '@mdi/js';

const props = withDefaults(defineProps<DrawControlProps>(), {
  ...defaultMapProps,
});
const drawOptions = ref(props.drawOptions);
const drawHandle = createMapDrawControl({
  primaryColor: props.drawOptions?.primaryColor,
  activeColor: props.drawOptions?.activeColor,
  drawControlOptions: props.drawControlOptions,
});
const control = drawHandle.control;
const { mapId, moduleContainerProps, callMap, order } = useMap(props);
useEnsureDrawBuiltinLocales(mapId.value);
const isShow = ref(false);
function onStart(config: MapDrawOption) {
  isShow.value = true;
  drawOptions.value = props.drawOptions || config;
  drawSupport.value = drawOptions.value.drawSupports || [];
  callMap((map) => {
    map.on('draw.create', onDrawCreated);
    map.on('draw.update', onDrawUpdated);
    map.on('draw.delete', onDrawDeleted);
    drawHandle.addToMap(map);
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
    drawHandle.removeFromMap(map);
  });
}

onBeforeUnmount(() => {
  close();
});

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
  removeEventClick,
  current_feature,
  isDraw,
  method,
  selectMethod,
  startCreate,
  prepareSave,
  finishCancel,
  redrawNonDraft,
} = useDrawEvents(mapId.value, control, drawOptions, {
  redrawSource,
});

function onSelectMethod(value: 'select' | 'delete') {
  selectMethod(value);
}
function onDraw(type: string) {
  current_feature.value = undefined;
  startCreate(type);
}
const drawSupport = ref<MapDrawConfig['drawSupports']>([]);

async function onSave() {
  prepareSave();
  await save(control.getAll() as FeatureCollection, getContext());
  if (drawOptions.value?.cleanAfterDone) {
    control.deleteAll();
  }
  getCountDraftItem();
  await redrawNonDraft();
}

async function onCancel() {
  const action = drawOptions.value;
  await finishCancel((feature) => {
    action?.cancel?.(feature);
    if (action?.cleanAfterDone) {
      control.deleteAll();
    }
  });
  getCountDraftItem();
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
      return {
        id: x,
        name: DrawingTypeName[x as keyof typeof DrawingTypeName] || x,
      };
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

const { control: toolbarControl } = useToolbarControl(mapId.value, props, {
  kind: 'module',
  moduleId: 'mapDrawControl',
  order: order.value,
  orientation: 'row',
  buttons: [
    {
      id: 'cancel',
      getState: () =>
        mdiButtonState(mdiClose, {
          visible: isShow.value && isDraw.value,
          title: 'Cancel',
        }),
      onClick: () => onCancel(),
    },
    {
      id: 'save',
      getState: () =>
        mdiButtonState(mdiContentSave, {
          visible: isShow.value && isDraw.value,
          title: 'Save',
        }),
      onClick: () => {
        void onSave();
      },
    },
    {
      id: 'close',
      getState: () =>
        mdiButtonState(mdiClose, {
          visible: isShow.value && !isDraw.value,
          title: 'Close',
        }),
      onClick: () => close(),
    },
    {
      id: 'add',
      getState: () =>
        mdiButtonState(mdiPlus, {
          visible: isShow.value && !isDraw.value,
          active: method.value === 'create',
          title: 'Draw',
        }),
      onClick: (e) => onStartDraw(e),
    },
    {
      id: 'select',
      getState: () =>
        mdiButtonState(mdiPencil, {
          visible: isShow.value && !isDraw.value,
          active: method.value === 'select',
          title: 'Select',
        }),
      onClick: () => onSelectMethod('select'),
    },
    {
      id: 'delete',
      getState: () =>
        mdiButtonState(mdiDeleteOutline, {
          visible: isShow.value && !isDraw.value,
          active: method.value === 'delete',
          title: 'Delete',
        }),
      onClick: () => onSelectMethod('delete'),
    },
    {
      id: 'commit',
      getState: () =>
        mdiButtonState(mdiContentSaveCheck, {
          visible: !!(
            isDraftOption(drawOptions.value) && drawOptions.value?.draft?.show
          ),
          disabled: isDraw.value || draftCounts.value === 0,
          title: 'Commit drafts',
        }),
      onClick: () => onCommit(),
    },
    {
      id: 'discard',
      getState: () =>
        mdiButtonState(mdiUndoVariant, {
          visible: !!(
            isDraftOption(drawOptions.value) && drawOptions.value?.draft?.show
          ),
          disabled: isDraw.value || draftCounts.value === 0,
          title: 'Discard drafts',
        }),
      onClick: () => onDiscard(),
    },
    {
      id: 'list',
      getState: () =>
        mdiButtonState(mdiViewListOutline, {
          visible: !!(
            isDraftOption(drawOptions.value) && drawOptions.value?.draft?.show
          ),
          disabled: draftCounts.value === 0,
          title: 'Draft list',
        }),
      onClick: () => onShowListDraftItem(),
    },
  ],
});
watch([isShow, isDraw, method, draftCounts, drawOptions], () =>
  toolbarControl.sync(),
);
</script>
<template>
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
          <span>{{ option.name }}</span>
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
