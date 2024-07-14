<script setup>
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCog } from '@mdi/js';
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
    'setting-control': {
      title: 'Setting',
      field: {
        zoom: 'Zoom',
        center: 'Center',
        sprite: 'Sprite url',
        glyphs: 'Glyphs url',
      },
      btn: {
        apply: 'Apply',
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
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="onToggleShow()"
        :tooltip="trans('map.setting-control.title')"
      >
        <SvgIcon :size="18" type="mdi" :path="mdiCog" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        :height="400"
        :width="400"
        v-bind="props"
        v-model:show="show"
        :title="trans('map.setting-control.title')"
      >
        <div class="setting-container">
          <div class="setting-field-container">
            <div>
              <label>
                {{ trans('map.setting-control.field.center') }}
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

          <base-button class="btn-container" @click="onSetSetting()">
            {{ trans('map.setting-control.btn.apply') }}
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
