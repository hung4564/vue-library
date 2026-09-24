<template>
  <div class="map-row create-control-settings">
    <div class="map-col-6">
      <input-text
        v-model="form.minzoom"
        :label="trans('map.layer-control.field.minzoom')"
      />
    </div>
    <div class="map-col-6">
      <input-text
        v-model="form.maxzoom"
        :label="trans('map.layer-control.field.maxzoom')"
      />
    </div>

    <template v-if="form.bounds">
      <div class="map-col-6">
        <input-text
          v-model="form.bounds[0]"
          :label="trans('map.layer-control.field.bound.minx')"
        />
      </div>
      <div class="map-col-6">
        <input-text
          v-model="form.bounds[1]"
          :label="trans('map.layer-control.field.bound.miny')"
        />
      </div>
      <div class="map-col-6">
        <input-text
          v-model="form.bounds[2]"
          :label="trans('map.layer-control.field.bound.maxx')"
        />
      </div>
      <div class="map-col-6">
        <input-text
          v-model="form.bounds[3]"
          :label="trans('map.layer-control.field.bound.maxy')"
        />
      </div>
    </template>

    <SourceLayerOptions
      v-if="form.tileKind === 'vector'"
      :options="options"
      @update:options="onOptions"
    />
  </div>
</template>

<script setup>
import { useLang, useMap } from '@hungpvq/vue-map-core';
import { InputText } from '@hungpvq/vue-map-core/fields';
import { computed } from 'vue';

import SourceLayerOptions from './source-layer-options.vue';

const form = defineModel();
const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const options = computed(() =>
  Array.isArray(form.value?.sourceLayerOptions)
    ? form.value.sourceLayerOptions
    : [],
);

function onOptions(next) {
  form.value.sourceLayerOptions = next;
}
</script>
