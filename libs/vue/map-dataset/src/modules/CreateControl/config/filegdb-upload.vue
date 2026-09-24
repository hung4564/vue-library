<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <div v-if="showFileSummary" class="create-control-loaded">
        <div class="create-control-loaded__head">
          <div>
            <p class="create-control-loaded__eyebrow">
              {{ trans('map.layer-control.create.loaded-from-file') }}
            </p>
            <p class="create-control-loaded__title">{{ loadedSource.label }}</p>
            <p v-if="loadedSource.detail" class="create-control-loaded__detail">
              {{ loadedSource.detail }}
            </p>
          </div>
          <MapControlButton
            type="button"
            @click="clearLoadedData"
            variant="outlined"
          >
            {{ trans('map.layer-control.create.clear-data') }}
          </MapControlButton>
        </div>
        <ul v-if="loadedMetaChips.length" class="create-control-loaded__meta">
          <li
            v-for="chip in loadedMetaChips"
            :key="chip"
            class="create-control-loaded__chip"
          >
            {{ chip }}
          </li>
        </ul>
        <div class="create-control-loaded__actions">
          <MapControlButton
            type="button"
            @click="replaceFileMode = true"
            variant="outlined"
          >
            {{ trans('map.layer-control.create.replace-file') }}
          </MapControlButton>
        </div>
      </div>

      <template v-if="!showFileSummary || replaceFileMode">
        <div class="create-control-drop">
          <DragDropFile
            :multiple="true"
            :accept="FILEGDB_FILE_ACCEPT"
            :resolve-drop-files="collectFileGdbFilesFromDataTransfer"
            @change="onChangeFile"
          />
          <div
            class="create-control-loaded__actions"
            style="margin-top: 0.75rem"
          >
            <MapControlButton
              type="button"
              variant="outlined"
              @click="openFolderPicker"
            >
              {{ trans('map.layer-control.create.filegdb-choose-folder') }}
            </MapControlButton>
          </div>
          <div v-if="parsing" class="create-control-status--busy">
            <span>{{
              parseStatusText || trans('map.layer-control.create.parsing')
            }}</span>
            <MapControlButton
              type="button"
              @click="cancelParsing"
              variant="outlined"
            >
              {{ trans('map.layer-control.create.cancel') }}
            </MapControlButton>
          </div>
        </div>
        <p class="create-control-status">
          {{ trans('map.layer-control.create.file-hint-filegdb') }}
        </p>
        <div v-if="parseError" class="create-control-sample-error">
          {{ parseError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  applyCreateControlLayerName,
  assertCreateControlFileSize,
  buildCreateControlLoadedMetaChips,
  collectFileGdbFilesFromDataTransfer,
  createControlGeojsonPreviewPatch,
  FILEGDB_FILE_ACCEPT,
  formatCreateControlParseStatus,
  looksLikeFileGdbFiles,
  parseCreateControlUploadedFiles,
  subscribeCreateControlParseProgress,
  summarizeCreateControlUploadFiles,
} from '@hungpvq/map-dataset/create-control';
import { terminateGeojsonWorker } from '@hungpvq/map-dataset/geojson';
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import { DragDropFile } from '@hungpvq/vue-map-core/fields';
import { computed, markRaw, ref } from 'vue';

const form = defineModel();
const parsing = ref(false);
const parseError = ref('');
const parseStatusText = ref('');
const loadedSource = ref(null);
const replaceFileMode = ref(false);
let parseGeneration = 0;
let folderInput;

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const showFileSummary = computed(
  () =>
    !!form.value?.geojson &&
    loadedSource.value?.kind === 'file' &&
    !replaceFileMode.value,
);

const loadedMetaChips = computed(() =>
  buildCreateControlLoadedMetaChips(loadedSource.value, {
    featuresCount: trans.value('map.layer-control.create.features-count'),
    geometryTypes: trans.value('map.layer-control.create.geometry-types'),
  }),
);

function syncGeojsonPreview(geojson, crs, layers) {
  const patch = createControlGeojsonPreviewPatch(geojson, crs, layers);
  if (patch.geojson) {
    form.value.geojson = markRaw(patch.geojson);
  } else {
    form.value.geojson = patch.geojson;
  }
  if ('crs' in patch) form.value.crs = patch.crs;
  if ('detectedCrs' in patch) form.value.detectedCrs = patch.detectedCrs;
  if ('gdbLayers' in patch) {
    form.value.gdbLayers = Array.isArray(patch.gdbLayers)
      ? markRaw(patch.gdbLayers)
      : patch.gdbLayers;
  }
  if ('sourceLayers' in patch) form.value.sourceLayers = patch.sourceLayers;
  if ('sourceLayerOptions' in patch) {
    form.value.sourceLayerOptions = patch.sourceLayerOptions;
  }
}

function clearLoadedData() {
  parseGeneration += 1;
  loadedSource.value = null;
  replaceFileMode.value = false;
  parseError.value = '';
  syncGeojsonPreview(null);
}

function cancelParsing() {
  parseGeneration += 1;
  terminateGeojsonWorker();
  parsing.value = false;
  parseStatusText.value = '';
}

function openFolderPicker() {
  if (!folderInput) {
    folderInput = document.createElement('input');
    folderInput.type = 'file';
    folderInput.multiple = true;
    folderInput.setAttribute('webkitdirectory', '');
    folderInput.setAttribute('directory', '');
    folderInput.onchange = () => {
      const list = folderInput.files;
      if (list?.length) void onChangeFile(Array.from(list));
      folderInput.value = '';
    };
  }
  folderInput.click();
}

function normalizeUploadFiles(input) {
  const files = Array.isArray(input) ? input : input ? [input] : [];
  return files.filter((file) => file instanceof File);
}

/** Keep only members under `*.gdb/` when the picker returned a parent folder. */
function filterGdbUploadFiles(files) {
  const nested = files.filter((file) =>
    (file.webkitRelativePath || file.name || '')
      .replace(/\\/g, '/')
      .toLowerCase()
      .includes('.gdb/'),
  );
  return nested.length ? nested : files;
}

async function onChangeFile(input) {
  const files = filterGdbUploadFiles(normalizeUploadFiles(input));
  if (!files.length) return;

  if (!looksLikeFileGdbFiles(files)) {
    parseError.value = trans.value('map.layer-control.create.parse-error');
    return;
  }

  const gen = ++parseGeneration;
  parseError.value = '';
  try {
    assertCreateControlFileSize(files);
  } catch (err) {
    parseError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.parse-error');
    syncGeojsonPreview(null);
    loadedSource.value = null;
    return;
  }

  const { totalBytes } = summarizeCreateControlUploadFiles(files);
  const parsingLabel = trans.value('map.layer-control.create.parsing');
  parsing.value = true;
  parseStatusText.value = formatCreateControlParseStatus(
    parsingLabel,
    totalBytes,
  );
  const unsubProgress = subscribeCreateControlParseProgress(
    parsingLabel,
    totalBytes,
    (text) => {
      parseStatusText.value = text;
    },
  );
  try {
    const result = await parseCreateControlUploadedFiles(files);
    if (gen !== parseGeneration) return;
    syncGeojsonPreview(result.geojson, result.crs, result.layers);
    loadedSource.value = result.loadedSource;
    form.value.name = applyCreateControlLayerName(
      form.value.name,
      result.suggestedName,
      'filegdb',
    );
    replaceFileMode.value = false;
  } catch (err) {
    if (gen !== parseGeneration) return;
    parseError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.parse-error');
    syncGeojsonPreview(null);
    loadedSource.value = null;
  } finally {
    unsubProgress();
    if (gen === parseGeneration) {
      parsing.value = false;
      parseStatusText.value = '';
    }
  }
}
</script>
