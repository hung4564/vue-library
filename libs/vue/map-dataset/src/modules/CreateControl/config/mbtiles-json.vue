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
              {{ loadedSource?.label || form.name || 'MBTiles' }}
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

      <template v-else>
        <div class="create-control-drop">
          <DragDropFile
            accept=".mbtiles,application/octet-stream"
            @change="onFileChange"
          />
          <div v-if="loadingFile" class="create-control-status--busy">
            <span>{{ trans('map.layer-control.create.parsing') }}</span>
          </div>
        </div>
        <p class="create-control-status">
          {{ trans('map.layer-control.create.file-hint-mbtiles') }}
        </p>
        <div v-if="fileError" class="create-control-sample-error">
          {{ fileError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  buildCreateControlArchiveMetaChips,
  createControlLoadedSourceEyebrowKey,
  formatCreateControlBytes,
  loadCreateControlVectorTileFromFile,
} from '@hungpvq/map-dataset/create-control';
import { closeVectorTileArchive } from '@hungpvq/map-dataset/vector-tile';
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import { DragDropFile } from '@hungpvq/vue-map-core/fields';
import { computed, ref } from 'vue';

const form = defineModel();
const loadingFile = ref(false);
const fileError = ref('');
const loadedSource = ref(null);
const { mapId } = useMap();
const { trans } = useLang(mapId.value);

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
  fileError.value = '';
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
        'mbtiles',
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
