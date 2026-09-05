<script setup lang="ts">
import { SETTING_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiCog } from '@mdi/js';
import type { SpriteSpecification } from 'maplibre-gl';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { BaseButton, InputText } from '../../field';
import { defaultMapProps, useMap, useShow, WithShowProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(props.show);
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault(SETTING_CONTROL_LOCALE);
function onToggleShow() {
  setShow(!show.value);
  if (show.value) {
    callMap((_map) => {
      setting.value.zoom = _map.getZoom();
      setting.value.center = [
        +_map.getCenter().lng.toFixed(6),
        +_map.getCenter().lat.toFixed(6),
      ];
      setting.value.sprite = _map.getStyle().sprite;
      setting.value.glyphs = _map.getStyle().glyphs;
    });
  }
}
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapSettingControl',
  panelKind: 'popup',
  title: () => trans.value('map.setting-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapSettingControl',
      run: () => onToggleShow(),
    },
  ],
});
const setting = ref<{
  zoom?: number;
  center: [number, number];
  sprite?: SpriteSpecification;
  glyphs?: string;
}>({
  zoom: undefined,
  center: [0, 0],
  sprite: undefined,
  glyphs: undefined,
});
const onSetSetting = () => {
  callMap((map) => {
    if (setting.value.zoom) map.setZoom(setting.value.zoom);
    if (setting.value.center) map.setCenter(setting.value.center);
    const style = map.getStyle();
    if (setting.value.sprite) {
      style.sprite = setting.value.sprite;
    }
    if (setting.value.glyphs) {
      style.glyphs = setting.value.glyphs;
    }
    map.setStyle(style);
  });
};
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapSettingControl',
  getState() {
    return {
      visible: true,
      title: trans.value('map.setting-control.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: mdiCog,
      },
    };
  },
  onClick() {
    onToggleShow();
  },
});
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
        :height="400"
        :width="400"
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

          <base-button
            class="map-setting-control__apply"
            @click="onSetSetting()"
          >
            {{ trans('map.setting-control.btn.apply') }}
          </base-button>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
