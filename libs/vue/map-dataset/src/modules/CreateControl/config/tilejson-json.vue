<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <div v-if="showLoaded" class="create-control-loaded">
        <div class="create-control-loaded__head">
          <div>
            <p class="create-control-loaded__eyebrow">
              {{
                trans(
                  createControlLoadedSourceEyebrowKey(
                    loadedSource?.kind ?? 'url',
                  ),
                )
              }}
            </p>
            <p class="create-control-loaded__title">
              {{ loadedSource?.label || form.name || 'TileJSON' }}
            </p>
            <p
              v-if="loadedSource?.detail"
              class="create-control-loaded__detail"
            >
              {{ loadedSource.detail }}
            </p>
          </div>
          <MapControlButton type="button" variant="outlined" @click="clearLoaded">
            {{ trans('map.layer-control.create.clear-data') }}
          </MapControlButton>
        </div>
        <ul v-if="metaChips.length" class="create-control-loaded__meta">
          <li
            v-for="chip in metaChips"
            :key="chip"
            class="create-control-loaded__chip"
          >
            {{ chip }}
          </li>
        </ul>
      </div>

      <template v-else>
        <InputSelect
          :model-value="sampleId"
          :items="sampleItems"
          :label="trans('map.layer-control.create.sample')"
          @update:model-value="onSelectSample"
        />
        <InputActionRow>
          <InputText
            v-model="dataUrl"
            :label="trans('map.layer-control.field.url')"
            @update:model-value="onUrlInput"
          />
          <template #action>
            <MapControlButton
              :disabled="loadingUrl || !dataUrl.trim()"
              @click="onLoadUrl"
              variant="tonal"
            >
              {{ trans('map.layer-control.create.load') }}
            </MapControlButton>
          </template>
        </InputActionRow>
        <p class="create-control-status">
          {{ trans('map.layer-control.create.file-hint-tilejson') }}
        </p>
        <div v-if="loadingUrl" class="create-control-status">
          {{ trans('map.layer-control.create.loading-url') }}
        </div>
        <div v-if="urlError" class="create-control-sample-error">
          {{ urlError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import {
  InputActionRow,
  InputSelect,
  InputText,
} from '@hungpvq/vue-map-core/fields';
import {
  CREATE_CONTROL_SAMPLE_NONE,
  buildCreateControlArchiveMetaChips,
  createControlLoadedSourceEyebrowKey,
  getCreateControlSamples,
  loadCreateControlTileJsonFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
} from '@hungpvq/map-dataset/create-control';
import { computed, ref } from 'vue';

const form = defineModel();
const sampleId = ref('');
const dataUrl = ref('');
const loadingUrl = ref(false);
const urlError = ref('');
const loadedSource = ref(null);

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const sampleItems = computed(() => [
  { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
  ...getCreateControlSamples('tilejson').map((item) => ({
    value: item.id,
    text: item.label,
  })),
]);

const showLoaded = computed(
  () =>
    !!loadedSource.value &&
    Array.isArray(form.value?.tiles) &&
    form.value.tiles.length > 0,
);

const metaChips = computed(() => {
  if (!showLoaded.value) return [];
  return buildCreateControlArchiveMetaChips(form.value, {
    tileKindVector: trans.value('map.layer-control.create.tile-kind-vector'),
    tileKindRaster: trans.value('map.layer-control.create.tile-kind-raster'),
    format: trans.value('map.layer-control.create.meta-format'),
    zoom: trans.value('map.layer-control.create.meta-zoom'),
    layers: trans.value('map.layer-control.create.meta-layers'),
    bounds: trans.value('map.layer-control.create.meta-bounds'),
  });
});

function onSelectSample(id) {
  const nextId = typeof id === 'string' ? id : '';
  sampleId.value = nextId;
  urlError.value = '';
  const url = resolveCreateControlSampleSelection('tilejson', nextId);
  if (url != null) dataUrl.value = url;
}

function onUrlInput() {
  urlError.value = '';
  sampleId.value = resolveCreateControlSampleIdAfterUrlEdit(
    'tilejson',
    sampleId.value,
    dataUrl.value,
  );
}

function clearLoaded() {
  Object.assign(form.value, {
    url: '',
    tiles: [],
    format: '',
    tileKind: 'vector',
    sourceLayer: '',
    sourceLayers: [],
    sourceLayerOptions: [],
    minzoom: 0,
    maxzoom: 22,
    bounds: [-180, -85.051129, 180, 85.051129],
  });
  loadedSource.value = null;
  urlError.value = '';
}

async function onLoadUrl() {
  const url = dataUrl.value.trim();
  if (!url) return;
  loadingUrl.value = true;
  urlError.value = '';
  try {
    const { patch, loadedSource: next } =
      await loadCreateControlTileJsonFromUrl({
        url,
        sampleId: sampleId.value,
        currentName: form.value.name,
      });
    Object.assign(form.value, patch);
    loadedSource.value = next;
  } catch (err) {
    urlError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.url-error');
  } finally {
    loadingUrl.value = false;
  }
}
</script>
