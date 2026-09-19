<script setup lang="ts">
import {
  applyGotoSetting,
  gotoSettingFromCoordinateText,
  readGotoSetting,
  type GotoSetting,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
import { ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow, WithShowProps } from '../../hooks/useShow';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
import MapControlButton from '../../components/MapControlButton.vue';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(props.show);
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
function onToggleShow() {
  setShow(!show.value);
  if (show.value) {
    callMap((_map) => {
      setting.value = readGotoSetting(_map);
    });
  }
}
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapGotoControl',
  panelKind: 'popup',
  title: () => trans.value('map.goto-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapGotoControl',
      run: () => onToggleShow(),
    },
  ],
});
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
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapGotoControl',
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
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        :height="300"
        :width="400"
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
            <map-control-button @click="onPasteCoordinates()" variant="outlined">
              {{ trans('map.goto-control.btn.paste') }}
            </map-control-button>
            <map-control-button class="map-goto-control__btn" @click="onSetSetting()" variant="filled">
              {{ trans('map.goto-control.btn.apply') }}
            </map-control-button>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
