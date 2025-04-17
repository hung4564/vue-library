<template>
  <div class="map-row">
    <slot></slot>

    <div class="map-col-12">
      <input-text
        v-model="form.url"
        :label="trans('map.layer-control.field.url')"
      />
    </div>
  </div>
</template>
<script setup>
import { InputText, useLang, useMap } from '@hungpvq/vue-map-core';
const form = defineModel();
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
</script>
<style></style>
