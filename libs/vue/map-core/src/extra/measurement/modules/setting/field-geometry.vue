<script setup lang="ts">
import type { DraftCoordinatesNumber } from '@hungpvq/map-core';
import { parseCoordinateListText } from '@hungpvq/map-core';
import {
  buildMeasurementGeojsonDownload,
  draftCoordinatesToFeature,
} from '@hungpvq/map-core/measurement';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiDownloadOutline,
  mdiPlus,
  mdiUploadOutline,
} from '@mdi/js';
import FileSaver from 'file-saver';
import type { Feature } from 'geojson';
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: DraftCoordinatesNumber[];
  maxLength?: number;
  title?: string;
  titleActionDownload?: string;
  titleActionFillBound?: string;
  titleActionAddPoint?: string;
}>();

const model = defineModel<DraftCoordinatesNumber[]>({
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
  (_e: 'click:fillbound', _geometry: Feature): void;
}>();

const submit = (value: DraftCoordinatesNumber[] = []) => {
  model.value = [...value];
};

const onAddItem = () => {
  if (!model.value) {
    model.value = [];
  }
  model.value.push([null, null]);
};

const onUpdatePathItem = () => {
  submit(model.value);
};

const onDeleteItem = (index: number) => {
  model.value.splice(index, 1);
  emit('click:remove', index);
  submit(model.value);
};

/** Paste one pair or multi-line CSV into the list (from this row). */
function onPasteCoordinate(event: ClipboardEvent, index: number) {
  const text = event.clipboardData?.getData('text') ?? '';
  const parsed = parseCoordinateListText(text);
  if (!parsed.length) return;
  event.preventDefault();

  const max = props.maxLength ?? 0;
  let points = parsed.map(
    ([lng, lat]) => [lng, lat] as DraftCoordinatesNumber,
  );
  if (max > 0) {
    const room = Math.max(0, max - index);
    points = points.slice(0, room);
  }
  if (!points.length) return;

  const next = [
    ...model.value.slice(0, index),
    ...points,
    ...model.value.slice(index + points.length),
  ];
  if (max > 0 && next.length > max) {
    submit(next.slice(0, max));
    return;
  }
  submit(next);
}

const onDownload = () => {
  const download = buildMeasurementGeojsonDownload(model.value);
  if (!download) return;
  FileSaver.saveAs(download.blob, download.fileName);
};

const onFlyTo = () => {
  const geom = draftCoordinatesToFeature(model.value);
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
      <div v-if="title" class="map-measurement-geometry__title">
        {{ title }}
      </div>
      <div class="map-measurement-geometry__actions">
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
            @paste="onPasteCoordinate($event, index)"
          />
        </div>
        <div class="">
          <input
            class="map-measurement-geometry__input"
            v-model="model[index][1]"
            type="number"
            step="any"
            @change="onUpdatePathItem()"
            @paste="onPasteCoordinate($event, index)"
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
