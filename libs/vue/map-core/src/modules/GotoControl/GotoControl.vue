<script setup lang="ts">
import {
  applyGotoSetting,
  type GotoSetting,
  gotoSettingFromCoordinateText,
  readGotoSetting,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
import { ref, watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow, WithShowProps } from '../../hooks/useShow';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(props.show);
const { callMap, mapId, order } = useMap(props);
const { trans } = useLang(mapId.value);
function onToggleShow() {
  setShow(!show.value);
  if (show.value) {
    callMap((_map) => {
      setting.value = readGotoSetting(_map);
    });
  }
}
const setting = ref<GotoSetting>({ center: [0, 0] });
const onSetSetting = () => {
  callMap((map) => {
    applyGotoSetting(map, setting.value);
  });
};
async function onPasteCoordinates() {
  try {
    const text = await navigator.clipboard?.readText?.();
    const partial = gotoSettingFromCoordinateText(text || '');
    if (!partial) return;
    setting.value = { ...setting.value, ...partial };
  } catch {
    // Clipboard permission denied — ignore.
  }
}
const singleButton = {
  kind: 'single' as const,
  getState() {
    return mdiButtonState(mdiMapMarkerOutline, {
      visible: true,
      active: show.value,
      title: trans.value('map.goto-control.title'),
      order: order.value,
    });
  },
  onClick() {
    onToggleShow();
  },
};
const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
  id: 'mapGotoControl',
  panelKind: 'popup',
  title: () => trans.value('map.goto-control.title'),
  from: props,
  order,
  show,
  setShow,
  defaultPanelSize: { width: 400, height: 300 },
  actions: [
    {
      type: 'mapGotoControl',
      run: () => onToggleShow(),
    },
  ],
  host: { button: singleButton },
  toolbar: singleButton,
});
watch(show, () => control?.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        v-bind="{ ...slotProps, ...panelBind }"
        v-model:show="show"
        :title="trans('map.goto-control.title')"
      >
        <div class="map-goto-control">
          <div class="map-goto-control__fields">
            <div>
              <label class="map-goto-control__center-label">
                {{ trans('map.goto-control.field.center') }}
              </label>
              <div class="map-goto-control__center">
                <InputText
                  v-model="setting.center[0]"
                  type="number"
                  step="0.0000001"
                />
                <InputText
                  v-model="setting.center[1]"
                  type="number"
                  step="0.0000001"
                />
              </div>
            </div>
            <div>
              <InputText
                :label="trans('map.goto-control.field.zoom')"
                v-model="setting.zoom"
                type="number"
                min="0"
                max="24"
              />
            </div>
          </div>

          <div class="map-goto-control__actions">
            <map-control-button
              @click="onPasteCoordinates()"
              variant="outlined"
            >
              {{ trans('map.goto-control.btn.paste') }}
            </map-control-button>
            <map-control-button
              class="map-goto-control__btn"
              @click="onSetSetting()"
              variant="filled"
            >
              {{ trans('map.goto-control.btn.apply') }}
            </map-control-button>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
