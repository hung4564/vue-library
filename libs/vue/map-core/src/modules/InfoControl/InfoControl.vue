<script lang="ts">
export default {
  name: 'InfoControl',
};
</script>
<script setup lang="ts">
import {
  copyImageDataUrl,
  downloadDataUrl,
  EMPTY_MAP_VIEW_INFO,
  INFO_CONTROL_LOCALE,
  latDMS,
  lngDMS,
  parseCoordinateText,
  readMapViewInfo,
  type MapSimple,
  type MapViewInfo,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { exportMapbox } from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCameraOutline,
  mdiContentCopy,
  mdiInformationOutline,
} from '@mdi/js';
import { computed, onUnmounted, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { MapControlButton, MapCopyButton } from '../../components';

import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow, WithShowProps } from '../../hooks/useShow';
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
const showDms = ref(false);
const centerDms = ref('');

function syncInfo() {
  callMap((map) => {
    info.value = readMapViewInfo(map);
    const c = map.getCenter();
    centerDms.value = `${latDMS(c.lat)}, ${lngDMS(c.lng)}`;
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
  {
    key: 'center',
    label: trans.value('map.info-control.center'),
    value: showDms.value ? centerDms.value || info.value.center : info.value.center,
  },
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
    return mdiButtonState(mdiInformationOutline, {
      visible: true,
      active: show.value,
      title: trans.value('map.info-control.title'),
      order: order.value,
    });
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

function onCopyImage() {
  callMap(async (map) => {
    capturing.value = true;
    try {
      const image = await exportMapbox(map);
      await copyImageDataUrl(image);
    } finally {
      capturing.value = false;
    }
  });
}

function toggleDms() {
  showDms.value = !showDms.value;
}

async function onPasteGoTo() {
  try {
    const text = await navigator.clipboard?.readText?.();
    const parsed = parseCoordinateText(text || '');
    if (!parsed) return;
    callMap((map) => {
      map.setCenter([parsed.lng, parsed.lat]);
      if (parsed.zoom != null) map.setZoom(parsed.zoom);
    });
  } catch {
    // Clipboard permission denied — ignore.
  }
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
        :height="380"
        :title="trans('map.info-control.title')"
      >
        <template #extra-btn>
          <MapControlButton
            :title="trans('map.info-control.screenshot')"
            :disabled="capturing"
            @click.stop="onScreenshot" variant="plain">
            <SvgIcon :size="16" type="mdi" :path="mdiCameraOutline" />
          </MapControlButton>
          <MapControlButton
            :title="trans('map.info-control.copy-image')"
            :disabled="capturing"
            @click.stop="onCopyImage" variant="plain">
            <SvgIcon :size="16" type="mdi" :path="mdiContentCopy" />
          </MapControlButton>
        </template>
        <div class="map-info-control">
          <div class="map-info-control__actions">
            <MapControlButton
              variant="outlined"
              :title="showDms ? trans('map.info-control.decimal') : trans('map.info-control.dms')"
              @click.stop="toggleDms"
            >
              {{ showDms ? trans('map.info-control.decimal') : trans('map.info-control.dms') }}
            </MapControlButton>
            <MapControlButton
              variant="outlined"
              :title="trans('map.info-control.paste')"
              @click.stop="onPasteGoTo"
            >
              {{ trans('map.info-control.paste') }}
            </MapControlButton>
          </div>
          <div class="map-info-control__rows">
            <div
              v-for="row in rows"
              :key="row.key"
              class="map-info-control__row"
            >
              <div class="map-info-control__label">{{ row.label }}</div>
              <div class="map-info-control__value">{{ row.value }}</div>
              <MapCopyButton
                class="map-info-control__copy"
                :value="row.value"
                :title="trans('map.info-control.copy')"
                :copied-title="trans('map.info-control.copied')"
              />
            </div>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
