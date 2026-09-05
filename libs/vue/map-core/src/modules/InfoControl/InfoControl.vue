<script lang="ts">
export default {
  name: 'InfoControl',
};
</script>
<script setup lang="ts">
import {
  copyText,
  downloadDataUrl,
  EMPTY_MAP_VIEW_INFO,
  INFO_CONTROL_LOCALE,
  exportMapbox,
  readMapViewInfo,
  type MapSimple,
  type MapViewInfo,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCameraOutline,
  mdiContentCopy,
  mdiInformationOutline,
} from '@mdi/js';
import { computed, onUnmounted, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { BaseButton } from '../../field';
import { defaultMapProps, useMap, useShow, WithShowProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        fileName?: string;
      }
  >(),
  {
    ...defaultMapProps,
    fileName: 'map',
  },
);

const [show, setShow] = useShow(props.show ?? false);
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(INFO_CONTROL_LOCALE);

const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapInfoControl',
  panelKind: 'popup',
  title: () => trans.value('map.info-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    fileName: props.fileName,
  }),
  actions: [
    {
      type: 'mapInfoControl',
      run: () => onToggleShow(),
    },
  ],
});

const info = ref<MapViewInfo>({ ...EMPTY_MAP_VIEW_INFO });
const capturing = ref(false);

function syncInfo() {
  callMap((map) => {
    info.value = readMapViewInfo(map);
  });
}

function attachListeners(map: MapSimple) {
  map.on('move', syncInfo);
  map.on('pitch', syncInfo);
  map.on('rotate', syncInfo);
  map.on('styledata', syncInfo);
}

function detachListeners(map: MapSimple) {
  map.off('move', syncInfo);
  map.off('pitch', syncInfo);
  map.off('rotate', syncInfo);
  map.off('styledata', syncInfo);
}

const rows = computed(() => [
  { key: 'center', label: trans.value('map.info-control.center'), value: info.value.center },
  { key: 'zoom', label: trans.value('map.info-control.zoom'), value: info.value.zoom },
  { key: 'pitch', label: trans.value('map.info-control.pitch'), value: info.value.pitch },
  { key: 'bearing', label: trans.value('map.info-control.bearing'), value: info.value.bearing },
  {
    key: 'projection',
    label: trans.value('map.info-control.projection'),
    value: info.value.projection,
  },
  { key: 'bounds', label: trans.value('map.info-control.bounds'), value: info.value.bounds },
]);

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapInfoControl',
  getState() {
    return {
      visible: true,
      active: show.value,
      title: trans.value('map.info-control.title'),
      order: order.value,
      icon: {
        type: 'mdi' as const,
        path: mdiInformationOutline,
      },
    };
  },
  onClick() {
    onToggleShow();
  },
});

watch(
  show,
  (visible) => {
    if (visible) {
      syncInfo();
      callMap(attachListeners);
    } else {
      callMap(detachListeners);
    }
    control.sync();
  },
);

onUnmounted(() => {
  callMap(detachListeners);
});

function onToggleShow() {
  setShow(!show.value);
}

function onCopy(value: string) {
  void copyText(value);
}

function onScreenshot() {
  callMap(async (map) => {
    capturing.value = true;
    try {
      const image = await exportMapbox(map);
      downloadDataUrl(image, `${props.fileName}.png`);
    } finally {
      capturing.value = false;
    }
  });
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      />
    </template>
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        v-bind="{ ...slotProps, ...panelBind }"
        :show="show"
        @update:show="setShow"
        @close="setShow(false)"
        :width="360"
        :height="340"
        :title="trans('map.info-control.title')"
      >
        <template #extra-btn>
          <BaseButton
            :title="trans('map.info-control.screenshot')"
            :disabled="capturing"
            @click.stop="onScreenshot"
          >
            <SvgIcon :size="16" type="mdi" :path="mdiCameraOutline" />
          </BaseButton>
        </template>
        <div class="map-info-control">
          <div class="map-info-control__rows">
            <div
              v-for="row in rows"
              :key="row.key"
              class="map-info-control__row"
            >
              <div class="map-info-control__label">{{ row.label }}</div>
              <div class="map-info-control__value">{{ row.value }}</div>
              <BaseButton
                class="map-info-control__copy"
                :title="trans('map.info-control.copy')"
                @click.stop="onCopy(row.value)"
              >
                <SvgIcon :size="14" type="mdi" :path="mdiContentCopy" />
              </BaseButton>
            </div>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
