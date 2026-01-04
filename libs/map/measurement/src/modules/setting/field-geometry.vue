<script setup lang="ts">
import type { CoordinatesNumber } from '@hungpvq/shared-map';
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
  <div class="field-container">
    <div class="label-container">
      <div class="label-field">
        {{ title }}
      </div>
      <div>
        <button
          type="button"
          @click="onFlyTo"
          :disabled="!modelValue || modelValue.length < 1"
          class="setting-button"
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
          class="setting-button"
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
          class="setting-button"
          v-if="isCanAdd"
        >
          <SvgIcon :size="16" type="mdi" :path="path.add" />
        </button>
      </div>
    </div>
    <div class="geometry-list-container">
      <div
        class="geometry-list-item"
        v-for="(item, index) in modelValue"
        :key="index"
      >
        <div>#{{ index + 1 }}</div>
        <div class="">
          <input
            class="setting-input"
            v-model="model[index][0]"
            type="number"
            step="any"
            @change="onUpdatePathItem()"
          />
        </div>
        <div class="">
          <input
            class="setting-input"
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
            class="setting-button"
          >
            <SvgIcon :size="16" type="mdi" :path="path.delete" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.label-container {
  display: flex;
}

.label-container .label-field {
  flex-grow: 1;
}

.geometry-list-item {
  display: flex;
  align-items: center;
  margin-right: -4px;
  margin-left: -4px;
}

.geometry-list-item > div {
  padding: 4px;
  color: inherit;
  background-color: transparent;
}

.setting-button {
  background-color: transparent;
  position: relative;
  cursor: pointer;
  display: inline-flex;
  overflow: hidden;
  vertical-align: middle;
  box-shadow: none;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  line-height: 24px;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.setting-input {
  padding: 8px;
  display: block;
  border: none;
  border-bottom: 1px solid #ccc;
  color: inherit;
  width: 100%;
  background-color: transparent;
}

button:disabled,
button[disabled] {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
