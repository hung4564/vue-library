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
                    loadedSource?.kind ?? 'file',
                  ),
                )
              }}
            </p>
            <p class="create-control-loaded__title">
              {{ loadedSource?.label || form.name || 'PMTiles' }}
            </p>
            <p
              v-if="loadedSource?.detail"
              class="create-control-loaded__detail"
            >
              {{ loadedSource.detail }}
            </p>
          </div>
          <MapControlButton
            type="button"
            variant="outlined"
            @click="clearLoaded"
          >
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

      <DataSourceTabs
        v-else
        v-model:active-tab="activeDataTab"
        :tabs="dataTabs"
      >
        <template #url>
          <InputActionRow>
            <InputText
              v-model="dataUrl"
              :label="trans('map.layer-control.field.url')"
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
          <div v-if="loadingUrl" class="create-control-status">
            {{ trans('map.layer-control.create.loading-url') }}
          </div>
          <div v-if="urlError" class="create-control-sample-error">
            {{ urlError }}
          </div>
        </template>

        <template #file>
          <div class="create-control-drop">
            <DragDropFile
              accept=".pmtiles,application/octet-stream"
              @change="onFileChange"
            />
            <div v-if="loadingFile" class="create-control-status--busy">
              <span>{{ trans('map.layer-control.create.parsing') }}</span>
            </div>
          </div>
          <p class="create-control-status">
            {{ trans('map.layer-control.create.file-hint-pmtiles') }}
          </p>
          <div v-if="fileError" class="create-control-sample-error">
            {{ fileError }}
          </div>
        </template>
      </DataSourceTabs>
    </div>
  </div>
</template>

<script setup>
import {
  buildCreateControlArchiveMetaChips,
  createControlLoadedSourceEyebrowKey,
  formatCreateControlBytes,
  getCreateControlDataTabs,
  loadCreateControlVectorTileFromFile,
  loadCreateControlVectorTileFromUrl,
} from '@hungpvq/map-dataset/create-control';
import { closeVectorTileArchive } from '@hungpvq/map-dataset/vector-tile';
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import {
  DragDropFile,
  InputActionRow,
  InputText,
} from '@hungpvq/vue-map-core/fields';
import { computed, ref } from 'vue';

import DataSourceTabs from './DataSourceTabs.vue';

const form = defineModel();
const dataUrl = ref('');
const loadingUrl = ref(false);
const loadingFile = ref(false);
const urlError = ref('');
const fileError = ref('');
const loadedSource = ref(null);

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const dataTabs = getCreateControlDataTabs('pmtiles');
const activeDataTab = ref(dataTabs[0]);

const showLoaded = computed(
  () => !!form.value?.archiveId && !!loadedSource.value,
);

const metaChips = computed(() => {
  if (!form.value?.archiveId) return [];
  const chips = buildCreateControlArchiveMetaChips(form.value, {
    tileKindVector: trans.value('map.layer-control.create.tile-kind-vector'),
    tileKindRaster: trans.value('map.layer-control.create.tile-kind-raster'),
    format: trans.value('map.layer-control.create.meta-format'),
    zoom: trans.value('map.layer-control.create.meta-zoom'),
    layers: trans.value('map.layer-control.create.meta-layers'),
    bounds: trans.value('map.layer-control.create.meta-bounds'),
  });
  if (typeof loadedSource.value?.bytes === 'number') {
    chips.push(formatCreateControlBytes(loadedSource.value.bytes));
  }
  return chips;
});

async function clearLoaded() {
  const archiveId = form.value?.archiveId;
  if (archiveId) {
    try {
      await closeVectorTileArchive(archiveId);
    } catch {
      /* ignore */
    }
  }
  Object.assign(form.value, {
    url: '',
    tiles: [],
    archiveId: undefined,
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
  dataUrl.value = '';
  fileError.value = '';
  urlError.value = '';
}

async function onLoadUrl() {
  const url = dataUrl.value.trim();
  if (!url) return;
  loadingUrl.value = true;
  urlError.value = '';
  try {
    const { patch, loadedSource: next } =
      await loadCreateControlVectorTileFromUrl({
        url,
        sampleId: '',
        currentName: form.value.name,
        layerKind: 'pmtiles',
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

async function onFileChange(picked) {
  const file = Array.isArray(picked) ? picked[0] : picked;
  if (!(file instanceof File)) return;
  loadingFile.value = true;
  fileError.value = '';
  try {
    const { patch, loadedSource: next } =
      await loadCreateControlVectorTileFromFile(
        file,
        form.value.name,
        'pmtiles',
      );
    Object.assign(form.value, patch);
    loadedSource.value = next;
  } catch (err) {
    fileError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.parse-error');
  } finally {
    loadingFile.value = false;
  }
}
</script>
