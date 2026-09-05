<script setup lang="ts">
import { GOTO_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
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

setLocaleDefault(GOTO_CONTROL_LOCALE);
function onToggleShow() {
  setShow(!show.value);
  if (show.value) {
    callMap((_map) => {
      setting.value.zoom = _map.getZoom();
      setting.value.center = [
        +_map.getCenter().lng.toFixed(6),
        +_map.getCenter().lat.toFixed(6),
      ];
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
const setting = ref<{
  zoom?: number;
  center: [number, number];
}>({ center: [0, 0] });
const onSetSetting = () => {
  callMap((map) => {
    if (setting.value.zoom) map.setZoom(setting.value.zoom);
    if (setting.value.center) map.setCenter(setting.value.center);
  });
};
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapGotoControl',
  getState() {
    return {
      visible: true,
      title: trans.value('map.goto-control.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: mdiMapMarkerOutline,
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

          <base-button class="map-goto-control__btn" @click="onSetSetting()">
            {{ trans('map.goto-control.btn.apply') }}
          </base-button>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
