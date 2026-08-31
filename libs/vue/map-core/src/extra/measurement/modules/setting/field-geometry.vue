<script setup lang="ts">
import type { CoordinatesNumber } from '@hungpvq/map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiDownloadOutline,
  mdiPlus,
  mdiUploadOutline,
} from '@mdi/js';
import { lineString, point, polygon } from '@turf/helpers';
import FileSaver from 'file-saver';
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: (CoordinatesNumber | [null, null])[];
  maxLength?: number;
  title?: string;
  titleActionDownload?: string;
  titleActionFillBound?: string;
  titleActionAddPoint?: string;
}>();

const model = defineModel<(CoordinatesNumber | [null, null])[]>({
  default: () => [[0, 0]],
});

const path = {
  add: mdiPlus,
  fillBound: mdiCrosshairsGps,
  delete: mdiDeleteOutline,
  download: mdiDownloadOutline,
  upload: mdiUploadOutline,
};

const emit = defineEmits<{
  (_e: 'click:remove', _index: number): void;
  (_e: 'click:fillbound', _geometry: any): void; // turf geometry
}>();

const submit = (value: (CoordinatesNumber | [null, null])[] = []) => {
  model.value = [...value];
};

const onAddItem = () => {
  if (!model.value) {
    model.value = [];
  }
  model.value.push([null, null] as any);
};

const onUpdatePathItem = () => {
  submit(model.value);
};

const onDeleteItem = (index: number) => {
  model.value.splice(index, 1);
  emit('click:remove', index);
  submit(model.value);
};

const convertGeometry = (coordinates: (CoordinatesNumber | [null, null])[]) => {
  const validCoords = coordinates.filter(
    (c): c is CoordinatesNumber => c[0] !== null && c[1] !== null,
  );
  if (!validCoords || !validCoords.length) {
    return;
  }
  if (validCoords.length === 1) {
    return point(validCoords[0]);
  }
  if (validCoords.length === 2) {
    return lineString(validCoords);
  }
  return polygon([[...validCoords, validCoords[0]]]);
};

const onDownload = () => {
  const geom = convertGeometry(model.value);
  if (!geom) return;
  const geojson = {
    type: 'FeatureCollection',
    features: [geom],
  };
  const blob = new window.Blob([JSON.stringify(geojson)], {
    type: 'text/plain;charset=utf-8',
  });

  FileSaver.saveAs(blob, 'geojson.json');
};

const onFlyTo = () => {
  const geom = convertGeometry(model.value);
  if (geom) {
    emit('click:fillbound', geom);
  }
};

const isCanAdd = computed(() => {
  return !(props.maxLength ?? 0) || model.value.length < (props.maxLength ?? 0);
});
</script>
<template>
  <div class="map-measurement-geometry">
    <div class="map-measurement-geometry__header">
      <div class="map-measurement-geometry__title">
        {{ title }}
      </div>
      <div>
        <button
          type="button"
          @click="onFlyTo"
          :disabled="!modelValue || modelValue.length < 1"
          class="map-measurement-geometry__btn"
          :title="titleActionFillBound"
        >
          <SvgIcon
            :size="16"
            type="mdi"
            :path="path.fillBound"
            :title="titleActionFillBound"
          />
        </button>
        <button
          type="button"
          @click="onDownload"
          class="map-measurement-geometry__btn"
          :disabled="!modelValue || modelValue.length < 1"
        >
          <SvgIcon
            :size="16"
            type="mdi"
            :path="path.download"
            :title="titleActionDownload"
          />
        </button>
        <button
          type="button"
          @click="onAddItem"
          class="map-measurement-geometry__btn"
          v-if="isCanAdd"
        >
          <SvgIcon :size="16" type="mdi" :path="path.add" />
        </button>
      </div>
    </div>
    <div class="map-measurement-geometry__list">
      <div
        class="map-measurement-geometry__item"
        v-for="(item, index) in modelValue"
        :key="index"
      >
        <div>#{{ index + 1 }}</div>
        <div class="">
          <input
            class="map-measurement-geometry__input"
            v-model="model[index][0]"
            type="number"
            step="any"
            @change="onUpdatePathItem()"
          />
        </div>
        <div class="">
          <input
            class="map-measurement-geometry__input"
            v-model="model[index][1]"
            type="number"
            step="any"
            @change="onUpdatePathItem()"
          />
        </div>
        <div class="">
          <button
            type="button"
            @click="onDeleteItem(index)"
            class="map-measurement-geometry__btn"
          >
            <SvgIcon :size="16" type="mdi" :path="path.delete" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
