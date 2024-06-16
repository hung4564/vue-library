<template>
  <div class="map-row">
    <slot></slot>
    <div class="map-col-12">
      <input-text
        v-model="form.url"
        :label="trans('map.layer-control.field.url')"
      />
    </div>
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
  </div>
</template>
<script setup>
import { InputText, useLang, useMap } from '@hungpv97/vue-map-core';
const form = defineModel();
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
</script>
