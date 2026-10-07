<script setup lang="ts">
import {
  applyMapStyleSettings,
  inputToSprite,
  readMapStyleSettings,
  spriteToInput,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiCog } from '@mdi/js';
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
      const next = readMapStyleSettings(_map);
      setting.value = {
        zoom: next.zoom,
        center: next.center,
        sprite: spriteToInput(next.sprite),
        glyphs: next.glyphs,
      };
    });
  }
}
const setting = ref<{
  zoom?: number;
  center: [number, number];
  sprite?: string;
  glyphs?: string;
}>({
  zoom: undefined,
  center: [0, 0],
  sprite: undefined,
  glyphs: undefined,
});
const onSetSetting = () => {
  callMap((map) => {
    applyMapStyleSettings(map, {
      zoom: setting.value.zoom,
      center: setting.value.center,
      sprite: inputToSprite(setting.value.sprite),
      glyphs: setting.value.glyphs,
    });
  });
};
const singleButton = {
  kind: 'single' as const,
  getState() {
    return mdiButtonState(mdiCog, {
      visible: true,
      active: show.value,
      title: trans.value('map.setting-control.title'),
      order: order.value,
    });
  },
  onClick() {
    onToggleShow();
  },
};
const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
  id: 'mapSettingControl',
  panelKind: 'popup',
  title: () => trans.value('map.setting-control.title'),
  from: props,
  order,
  show,
  setShow,
  defaultPanelSize: { width: 400, height: 400 },
  actions: [
    {
      type: 'mapSettingControl',
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
        :title="trans('map.setting-control.title')"
      >
        <div class="map-setting-control">
          <div class="map-setting-control__fields">
            <div>
              <label class="map-setting-control__center-label">
                {{ trans('map.setting-control.field.center') }}
              </label>
              <div class="map-setting-control__center">
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
                :label="trans('map.setting-control.field.zoom')"
                v-model="setting.zoom"
              />
            </div>
            <div>
              <InputText
                :label="trans('map.setting-control.field.sprite')"
                v-model="setting.sprite"
              />
            </div>
            <div>
              <InputText
                :label="trans('map.setting-control.field.glyphs')"
                v-model="setting.glyphs"
              />
            </div>
          </div>

          <map-control-button
            class="map-setting-control__apply"
            @click="onSetSetting()"
            variant="filled"
          >
            {{ trans('map.setting-control.btn.apply') }}
          </map-control-button>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
