<template>
  <div class="map-row create-control-settings">
    <div class="map-col-6">
      <InputSelect
        v-model="form.type"
        :items="items_type"
        :label="trans('map.layer-control.field.style-type')"
      />
    </div>
    <div class="map-col-6">
      <div class="form-group">
        <label>{{ trans('map.layer-control.field.color') }}</label>
        <div class="input-container create-control-color">
          <input
            type="color"
            :value="form.color"
            @input="onColorChange($event.target.value)"
          />
        </div>
      </div>
    </div>
    <div class="map-col-12">
      <InputCrs
        :model-value="form.crs || '4326'"
        :label="trans('map.layer-control.field.crs')"
        :placeholder="trans('map.layer-control.field.crs-placeholder')"
        @update:model-value="onCrsChange"
      />
    </div>
  </div>
</template>

<script setup>
import { getChartRandomColor } from '@hungpvq/map-core';
import { InputCrs, InputSelect, useLang, useMap } from '@hungpvq/vue-map-core';

const items_type = ['point', 'line', 'area'];
const form = defineModel();
const { mapId } = useMap();
const { trans } = useLang(mapId.value);

if (!form.value.crs) {
  form.value.crs = '4326';
}
if (!form.value.color) {
  form.value.color = getChartRandomColor();
}

function onCrsChange(crs) {
  form.value.crs = crs;
}

function onColorChange(color) {
  form.value.color = color;
}
</script>
