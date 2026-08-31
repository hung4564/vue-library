<script setup lang="ts">
import { InputCheckbox } from '../../../../field';
import { useMap } from '../../../../hooks';
import { useLang } from '../../../lang';
import { useMapCompareSetting } from '../../hooks';
const props = defineProps({
  mapId: { type: String, required: true },
});
const { mapId } = useMap(props);
const { trans, setLocaleDefault } = useLang(props.mapId);

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
</template>
