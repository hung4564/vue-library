<template>
  <div class="map-row">
    <slot></slot>
    <div class="map-col-12">
      <input-select
        v-model="form.type"
        :items="items_type"
        :label="trans('map.layer-control.field.type')"
      />
    </div>
    <div class="map-col-12">
      <DragDropFile @change="onChangeFile" accept=".json,.geojson" />
    </div>
    <div class="map-col-12" v-if="geojson_show">
      <InputTextArea
        :modelValue="geojson_show"
        rows="4"
        readonly
      ></InputTextArea>
    </div>
  </div>
</template>
<script setup>
import {
  InputSelect,
  InputTextArea,
  useLang,
  useMap,
} from '@hungpv97/vue-map-core';
import { DragDropFile, useFileReader } from '@hungpv97/shared-file';
import { ref } from 'vue';
const { read } = useFileReader();
const items_type = ['point', 'line', 'area'];
const form = defineModel();
const geojson_show = ref(null);
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
function onChangeFile(file) {
  read(file).then((res) => {
    form.value.geojson = res;
    geojson_show.value = res ? JSON.stringify(res, null, 2) : '';
  });
}
</script>
<style></style>
