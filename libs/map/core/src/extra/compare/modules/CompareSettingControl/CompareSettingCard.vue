<script setup lang="ts">
import { InputCheckbox } from '../../../../field';
import { useLang } from '../../../lang';
import { getMapCompareSetting } from '../../store';
const props = defineProps({
  mapId: { type: String, required: true },
});
const { trans, setLocaleDefault } = useLang(props.mapId);

setLocaleDefault({
  map: {
    'setting-control': {
      title: 'Setting',
      field: {
        compare: 'compare',
        split: 'split',
        sync: 'sync',
      },
      btn: {
        apply: 'Apply',
      },
    },
  },
});
const setting = getMapCompareSetting(props.mapId);
</script>
<template>
  <div class="setting-field-container">
    <!-- <div>
      <InputCheckbox
        :label="trans('map.setting-control.field.compare')"
        v-model="setting.compare"
      />
    </div> -->
    <div>
      <InputCheckbox
        :label="trans('map.setting-control.field.split')"
        v-model="setting.split"
      />
    </div>
    <div>
      <InputCheckbox
        :label="trans('map.setting-control.field.sync')"
        v-model="setting.sync"
      />
    </div>
  </div>
</template>
<style scoped>
.setting-field-container {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}
</style>
