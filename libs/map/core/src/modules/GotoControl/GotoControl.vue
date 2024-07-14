<script setup>
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMapMarkerOutline } from '@mdi/js';
import { ref } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { BaseButton, InputText } from '../../field';
import { useMap, useShow, withMapProps } from '../../hooks';
import { useLang } from '../../extra';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = defineProps({
  ...withMapProps,
});
const [show, setShow] = useShow(false);
const { callMap, mapId, moduleContainerProps } = useMap(props);
const { trans, setLocale } = useLang(mapId.value);

setLocale({
  map: {
    'goto-control': {
      title: 'Go to',
      field: {
        zoom: 'Zoom',
        center: 'Center',
        sprite: 'Sprite url',
        glyphs: 'Glyphs url',
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
        _map.getCenter().lng.toFixed(6),
        _map.getCenter().lat.toFixed(6),
      ];
      setting.value.sprite = _map.getStyle().sprite;
      setting.value.glyphs = _map.getStyle().glyphs;
    });
  }
}
const setting = ref({ zoom: null, center: null, sprite: null, glyphs: null });
const onSetSetting = () => {
  callMap((map) => {
    if (setting.value.zoom) map.setZoom(setting.value.zoom);
    if (setting.value.center) map.setCenter(setting.value.center);
  });
};
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="onToggleShow()"
        :tooltip="trans('map.goto-control.title')"
      >
        <SvgIcon :size="18" type="mdi" :path="mdiMapMarkerOutline" />
      </MapControlButton>
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
