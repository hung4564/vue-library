<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCog } from '@mdi/js';
import MapControlButton from '../../../../components/MapControlButton.vue';
import { InputCheckbox } from '../../../../field';
import {
  defaultMapProps,
  useMap,
  useShow,
  WithShowProps,
} from '../../../../hooks';
import ModuleContainer from '../../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../../lang';
import { useMapCompareSetting } from '../../hooks';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const [show, toggleShow] = useShow(props.show);
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault({
  map: {
    'setting-control': {
      title: 'Setting',
      field: {
        compare: 'compare',
        split: 'split',
        sync: 'sync',
        vertical: 'vertical',
      },
      btn: {
        apply: 'Apply',
      },
    },
  },
});
const { setting, updateSetting } = useMapCompareSetting(mapId.value);
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="toggleShow()"
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
        <div class="map-compare-setting">
          <div class="map-compare-setting__fields">
            <div>
              <InputCheckbox
                :label="trans('map.setting-control.field.split')"
                v-model="setting.split"
                @change="updateSetting()"
              />
            </div>
            <div>
              <InputCheckbox
                :label="trans('map.setting-control.field.vertical')"
                v-model="setting.vertical"
                @change="updateSetting()"
              />
            </div>
            <div>
              <InputCheckbox
                :label="trans('map.setting-control.field.sync')"
                v-model="setting.sync"
                @change="updateSetting()"
              />
            </div>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
