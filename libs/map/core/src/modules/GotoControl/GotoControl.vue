<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useToolbarControl } from '../../extra';
import { BaseButton, InputText } from '../../field';
import {
  defaultMapProps,
  useMap,
  useShow,
  WithShowProps,
  type WithMapPropType,
} from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(props.show);
const { callMap, mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault({
  map: {
    'goto-control': {
      title: 'Go to',
      field: {
        zoom: 'Zoom',
        center: 'Center',
      },
      btn: {
        apply: 'Go to',
      },
    },
  },
});
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
      <MapCommonButton v-if="state" :option="state" @click="control.onAction">
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        :height="300"
        :width="400"
        v-bind="props"
        v-model:show="show"
        :title="trans('map.goto-control.title')"
      >
        <div class="setting-container">
          <div class="setting-field-container">
            <div>
              <label>
                {{ trans('map.goto-control.field.center') }}
              </label>
              <div class="setting-center-container">
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

          <base-button class="btn-container" @click="onSetSetting()">
            {{ trans('map.goto-control.btn.apply') }}
          </base-button>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
<style>
.setting-container {
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.setting-field-container > div {
  padding: 4px;
}
.setting-container .setting-field-container {
  height: 100%;
  padding: 8px;
  flex-grow: 1;
  overflow: auto;
}
.setting-container .btn-container {
  flex-grow: 0;
  padding: 8px;
}
.setting-center-container {
  display: flex;
}
.setting-center-container > *:not(:last-child) {
  padding-right: 4px;
}
</style>
