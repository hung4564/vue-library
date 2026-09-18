<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <DataSourceTabs v-model:active-tab="activeDataTab" :tabs="dataTabs">
        <template #file>
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
              <MapControlButton type="button" @click="clearLoadedData" variant="outlined">
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
              <MapControlButton type="button" @click="replaceFileMode = true" variant="outlined">
                {{ trans('map.layer-control.create.replace-file') }}
              </MapControlButton>
            </div>
          </div>

          <div
            v-if="!showFileSummary || replaceFileMode"
            class="create-control-drop"
            tabindex="0"
            @paste="onOsClipboardPaste"
          >
            <DragDropFile
              :multiple="true"
              :accept="GIS_FILE_ACCEPT"
              :resolve-drop-files="collectFilesFromDataTransfer"
              @change="onChangeFile"
            />
            <div v-if="parsing" class="create-control-status--busy">
              <span>{{ parseStatusText || trans('map.layer-control.create.parsing') }}</span>
              <MapControlButton type="button" @click="cancelParsing" variant="outlined">
                {{ trans('map.layer-control.create.cancel') }}
              </MapControlButton>
            </div>
          </div>
          <p v-if="!showFileSummary || replaceFileMode" class="create-control-status">
            {{ trans('map.layer-control.create.file-hint') }}
          </p>
          <div v-if="parseError" class="create-control-sample-error">
            {{ parseError }}
          </div>
        </template>

        <template #raw>
          <div v-if="showLoadedRawCard" class="create-control-loaded">
            <div class="create-control-loaded__head">
              <div>
                <p class="create-control-loaded__eyebrow">
                  {{ loadedSourceEyebrow }}
                </p>
                <p class="create-control-loaded__title">{{ loadedSource.label }}</p>
                <p v-if="loadedSource.detail" class="create-control-loaded__detail">
                  {{ loadedSource.detail }}
                </p>
              </div>
              <MapControlButton type="button" @click="clearLoadedData" variant="outlined">
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
          </div>
          <template v-else>
            <InputTextArea
              :model-value="pasteText"
              rows="4"
              :label="trans('map.layer-control.create.paste-geojson')"
              :placeholder="trans('map.layer-control.create.paste-geojson-hint')"
              @update:model-value="onPasteGeojson"
            />
            <div v-if="parsing" class="create-control-status--row">
              <span>{{ trans('map.layer-control.create.parsing') }}</span>
            </div>
            <div v-if="parseError" class="create-control-sample-error">
              {{ parseError }}
            </div>
          </template>
        </template>

        <template #url>
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
                {{
                  loadingUrl
                    ? trans('map.layer-control.create.loading-url')
                    : trans('map.layer-control.create.load')
                }}
              </MapControlButton>
            </template>
          </InputActionRow>
          <div v-if="urlError" class="create-control-sample-error">
            {{ urlError }}
          </div>
        </template>
      </DataSourceTabs>
    </div>
  </div>
</template>

<script setup>
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import {
  DragDropFile,
  InputActionRow,
  InputSelect,
  InputText,
  InputTextArea,
} from '@hungpvq/vue-map-core/fields';
import {
  applyCreateControlLayerName,
  assertCreateControlFileSize,
  buildCreateControlLoadedMetaChips,
  createControlGeojsonPreviewPatch,
  createControlLoadedSourceEyebrowKey,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  collectFilesFromDataTransfer,
  formatCreateControlParseStatus,
  GIS_FILE_ACCEPT,
  getCreateControlDataTabs,
  getCreateControlSamples,
  loadCreateControlVectorFromUrl,
  looksCompleteGis,
  parseCreateControlPastedText,
  parseCreateControlUploadedFiles,
  readClipboardGisPaste,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
  subscribeCreateControlParseProgress,
  summarizeCreateControlUploadFiles,
} from '@hungpvq/map-dataset/create-control';
import { terminateGeojsonWorker } from '@hungpvq/map-dataset/geojson';
import { computed, markRaw, onBeforeUnmount, ref } from 'vue';
import DataSourceTabs from './DataSourceTabs.vue';

const form = defineModel();
const pasteText = ref('');
const sampleId = ref('');
const dataUrl = ref('');
const loadingUrl = ref(false);
const urlError = ref('');
const parsing = ref(false);
const parseError = ref('');
const parseStatusText = ref('');
const loadedSource = ref(null);
const replaceFileMode = ref(false);
let pasteTimer;
let parseGeneration = 0;

const { mapId } = useMap();
const { trans } = useLang(mapId.value);
const dataTabs = getCreateControlDataTabs('vector');
const activeDataTab = ref(CREATE_CONTROL_DEFAULT_DATA_TAB);

const sampleItems = computed(() => [
  { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
  ...getCreateControlSamples('vector').map((item) => ({
    value: item.id,
    text: item.label,
  })),
]);

const showLoadedRawCard = computed(
  () =>
    !!form.value?.geojson &&
    !!loadedSource.value &&
    (loadedSource.value.kind === 'file' || loadedSource.value.kind === 'url'),
);

const showFileSummary = computed(
  () =>
    !!form.value?.geojson &&
    loadedSource.value?.kind === 'file' &&
    !replaceFileMode.value,
);

const loadedSourceEyebrow = computed(() =>
  trans.value(createControlLoadedSourceEyebrowKey(loadedSource.value?.kind)),
);

const loadedMetaChips = computed(() =>
  buildCreateControlLoadedMetaChips(loadedSource.value, {
    featuresCount: trans.value('map.layer-control.create.features-count'),
    geometryTypes: trans.value('map.layer-control.create.geometry-types'),
  }),
);

function syncGeojsonPreview(geojson, crs) {
  const patch = createControlGeojsonPreviewPatch(geojson, crs);
  if (patch.geojson) {
    form.value.geojson = markRaw(patch.geojson);
  } else {
    form.value.geojson = patch.geojson;
  }
  if ('crs' in patch) form.value.crs = patch.crs;
  if ('detectedCrs' in patch) form.value.detectedCrs = patch.detectedCrs;
}

function clearUrlState() {
  sampleId.value = '';
  dataUrl.value = '';
  urlError.value = '';
}

function clearLoadedData() {
  parseGeneration += 1;
  pasteText.value = '';
  loadedSource.value = null;
  replaceFileMode.value = false;
  parseError.value = '';
  syncGeojsonPreview(null);
  clearUrlState();
}

function cancelParsing() {
  parseGeneration += 1;
  terminateGeojsonWorker();
  parsing.value = false;
  parseStatusText.value = '';
}

function onOsClipboardPaste(event) {
  const { files, text } = readClipboardGisPaste(event.clipboardData);
  if (files.length) {
    event.preventDefault();
    void onChangeFile(files);
    return;
  }
  const trimmed = text.trim();
  if (!trimmed) return;
  event.preventDefault();
  activeDataTab.value = 'raw';
  onPasteGeojson(trimmed);
}

async function onChangeFile(input) {
  const files = Array.isArray(input) ? input : input ? [input] : [];
  const gen = ++parseGeneration;
  clearUrlState();
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
  parseStatusText.value = formatCreateControlParseStatus(parsingLabel, totalBytes);
  const unsubProgress = subscribeCreateControlParseProgress(
    parsingLabel,
    totalBytes,
    (text) => {
      parseStatusText.value = text;
    },
  );
  try {
    pasteText.value = '';
    const result = await parseCreateControlUploadedFiles(files);
    if (gen !== parseGeneration) return;
    syncGeojsonPreview(result.geojson, result.crs);
    loadedSource.value = result.loadedSource;
    form.value.name = applyCreateControlLayerName(
      form.value.name,
      result.suggestedName,
      'vector',
    );
    replaceFileMode.value = false;
    activeDataTab.value = CREATE_CONTROL_DEFAULT_DATA_TAB;
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

function onPasteGeojson(text) {
  pasteText.value = text;
  clearUrlState();
  parseError.value = '';
  clearTimeout(pasteTimer);
  if (!text.trim()) {
    syncGeojsonPreview(null);
    loadedSource.value = null;
    return;
  }
  pasteTimer = setTimeout(async () => {
    parsing.value = true;
    try {
      const result = await parseCreateControlPastedText(
        text,
        trans.value('map.layer-control.create.loaded-from-paste'),
      );
      parseError.value = '';
      if (result) {
        syncGeojsonPreview(result.geojson, result.crs);
        loadedSource.value = result.loadedSource;
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : trans.value('map.layer-control.create.parse-error');
      if (looksCompleteGis(text)) parseError.value = message;
    } finally {
      parsing.value = false;
    }
  }, 400);
}

function onSelectSample(id) {
  const nextId = typeof id === 'string' ? id : '';
  sampleId.value = nextId;
  urlError.value = '';
  const url = resolveCreateControlSampleSelection('vector', nextId);
  if (url != null) dataUrl.value = url;
}

function onUrlInput() {
  urlError.value = '';
  sampleId.value = resolveCreateControlSampleIdAfterUrlEdit(
    'vector',
    sampleId.value,
    dataUrl.value,
  );
}

async function onLoadUrl() {
  const url = dataUrl.value.trim();
  if (!url) return;
  loadingUrl.value = true;
  urlError.value = '';
  pasteText.value = '';
  try {
    const { patch, loadedSource: nextSource } = await loadCreateControlVectorFromUrl({
      url,
      sampleId: sampleId.value,
      currentName: form.value.name,
    });
    const { geojson: nextGeojson, ...rest } = patch;
    Object.assign(form.value, rest);
    if ('geojson' in patch) {
      form.value.geojson = nextGeojson ? markRaw(nextGeojson) : nextGeojson;
    }
    loadedSource.value = nextSource;
    replaceFileMode.value = false;
    activeDataTab.value = CREATE_CONTROL_DEFAULT_DATA_TAB;
  } catch (err) {
    urlError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.url-error');
  } finally {
    loadingUrl.value = false;
  }
}

onBeforeUnmount(() => {
  clearTimeout(pasteTimer);
  cancelParsing();
});
</script>
