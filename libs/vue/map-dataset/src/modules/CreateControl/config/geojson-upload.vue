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
              <BaseButton type="button" @click="clearLoadedData">
                {{ trans('map.layer-control.create.clear-data') }}
              </BaseButton>
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
              <BaseButton type="button" @click="replaceFileMode = true">
                {{ trans('map.layer-control.create.replace-file') }}
              </BaseButton>
            </div>
          </div>

          <div
            v-if="!showFileSummary || replaceFileMode"
            class="create-control-drop"
          >
            <DragDropFile
              :multiple="true"
              :accept="GIS_FILE_ACCEPT"
              @change="onChangeFile"
            />
            <div v-if="parsing" class="create-control-status--busy">
              <span>{{ parseStatusText || trans('map.layer-control.create.parsing') }}</span>
              <BaseButton type="button" @click="cancelParsing">
                {{ trans('map.layer-control.create.cancel') }}
              </BaseButton>
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
              <BaseButton type="button" @click="clearLoadedData">
                {{ trans('map.layer-control.create.clear-data') }}
              </BaseButton>
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
          <div class="create-control-url-row">
            <InputText
              v-model="dataUrl"
              :label="trans('map.layer-control.field.url')"
              @update:model-value="onUrlInput"
            />
            <BaseButton
              class="create-control-url-load"
              :disabled="loadingUrl || !dataUrl.trim()"
              @click="onLoadUrl"
            >
              {{
                loadingUrl
                  ? trans('map.layer-control.create.loading-url')
                  : trans('map.layer-control.create.load')
              }}
            </BaseButton>
          </div>
          <div v-if="urlError" class="create-control-sample-error">
            {{ urlError }}
          </div>
        </template>
      </DataSourceTabs>
    </div>
  </div>
</template>

<script setup>
import {
  BaseButton,
  InputSelect,
  InputText,
  InputTextArea,
  useLang,
  useMap,
} from '@hungpvq/vue-map-core';
import { DragDropFile } from '@hungpvq/shared-file';
import { WorkerMonitor, workerProgressRatio } from '@hungpvq/map-core';
import {
  applyCreateControlSample,
  applyCreateControlLayerName,
  assertCreateControlFileSize,
  buildCreateControlLoadedSource,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  formatCreateControlBytes,
  GIS_FILE_ACCEPT,
  getCreateControlDataTabs,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  layerNameFromFileName,
  layerNameFromUrl,
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
  shortenCreateControlUrl,
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

const loadedSourceEyebrow = computed(() => {
  const kind = loadedSource.value?.kind;
  if (kind === 'file') return trans.value('map.layer-control.create.loaded-from-file');
  if (kind === 'url') return trans.value('map.layer-control.create.loaded-from-url');
  return trans.value('map.layer-control.create.loaded-from-paste');
});

const loadedMetaChips = computed(() => {
  const src = loadedSource.value;
  if (!src) return [];
  const chips = [];
  if (typeof src.featureCount === 'number') {
    chips.push(
      `${trans.value('map.layer-control.create.features-count')}: ${src.featureCount}`,
    );
  }
  if (src.geometryTypes?.length) {
    chips.push(
      `${trans.value('map.layer-control.create.geometry-types')}: ${src.geometryTypes.join(', ')}`,
    );
  }
  if (typeof src.bytes === 'number') {
    chips.push(formatCreateControlBytes(src.bytes));
  }
  return chips;
});

function looksCompleteGis(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  if (trimmed.startsWith('<') && /<\/[a-z]+>\s*$/i.test(trimmed)) return true;
  return /^(GEOMETRYCOLLECTION|MULTI(POINT|LINESTRING|POLYGON)|POINT|LINESTRING|POLYGON)\s*\([\s\S]*\)$/i.test(
    trimmed,
  );
}

function syncGeojsonPreview(geojson, crs) {
  form.value.geojson = geojson ? markRaw(geojson) : geojson;
  if (crs) {
    form.value.crs = crs;
    form.value.detectedCrs = crs;
  }
  if (!geojson) {
    form.value.detectedCrs = undefined;
  }
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
  const totalBytes = files.reduce((sum, file) => sum + (file?.size ?? 0), 0);
  const label =
    files.length === 1
      ? files[0]?.name || 'file'
      : `${files.length} files`;
  parsing.value = true;
  parseStatusText.value = `${trans.value('map.layer-control.create.parsing')} (${formatCreateControlBytes(totalBytes)})`;
  const unsubProgress = WorkerMonitor.subscribe(() => {
    const snap = WorkerMonitor.get('geojson');
    const task = snap?.pending?.[0];
    const ratio = workerProgressRatio(task?.progress);
    if (ratio == null) return;
    const pct = Math.round(ratio * 100);
    parseStatusText.value = `${trans.value('map.layer-control.create.parsing')} ${pct}% (${formatCreateControlBytes(totalBytes)})`;
  });
  try {
    pasteText.value = '';
    const { geojson, crs, format } = await loadGisFileAsync(files);
    if (gen !== parseGeneration) return;
    syncGeojsonPreview(geojson, crs);
    loadedSource.value = buildCreateControlLoadedSource({
      kind: 'file',
      label,
      detail: files.length > 1 ? files.map((f) => f.name).filter(Boolean).join(', ') : undefined,
      bytes: totalBytes,
      format,
      geojson,
    });
    const fileName = files[0]?.name || label;
    form.value.name = applyCreateControlLayerName(
      form.value.name,
      layerNameFromFileName(fileName),
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
      const { geojson, crs, format } = await loadGisTextAsync(text);
      parseError.value = '';
      if (geojson) {
        syncGeojsonPreview(geojson, crs);
        loadedSource.value = buildCreateControlLoadedSource({
          kind: 'paste',
          label: trans.value('map.layer-control.create.loaded-from-paste'),
          format,
          geojson,
        });
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
  if (!nextId) return;
  const sample = getCreateControlSamples('vector').find(
    (item) => item.id === nextId,
  );
  if (!sample) return;
  dataUrl.value = getCreateControlSampleUrl(sample);
}

function onUrlInput() {
  urlError.value = '';
  const trimmed = dataUrl.value.trim();
  const sample = getCreateControlSamples('vector').find(
    (item) => item.id === sampleId.value,
  );
  if (sample && getCreateControlSampleUrl(sample) !== trimmed) {
    sampleId.value = '';
  }
}

async function onLoadUrl() {
  const url = dataUrl.value.trim();
  if (!url) return;
  loadingUrl.value = true;
  urlError.value = '';
  pasteText.value = '';
  try {
    const sample = getCreateControlSamples('vector').find(
      (item) =>
        item.id === sampleId.value && getCreateControlSampleUrl(item) === url,
    );
    let geojson;
    let crs;
    let format;
    if (sample) {
      const patch = await applyCreateControlSample(sample);
      Object.assign(form.value, patch);
      form.value.name = applyCreateControlLayerName(
        form.value.name,
        sample.label,
        'vector',
      );
      geojson = patch.geojson ?? null;
      crs = patch.crs;
      syncGeojsonPreview(geojson, crs);
      loadedSource.value = buildCreateControlLoadedSource({
        kind: 'url',
        label: sample.label,
        detail: shortenCreateControlUrl(url),
        geojson,
      });
    } else {
      const result = await loadGisUrlAsync(url);
      geojson = result.geojson;
      crs = result.crs;
      format = result.format;
      syncGeojsonPreview(geojson, crs);
      form.value.name = applyCreateControlLayerName(
        form.value.name,
        layerNameFromUrl(url),
        'vector',
      );
      loadedSource.value = buildCreateControlLoadedSource({
        kind: 'url',
        label: shortenCreateControlUrl(url),
        detail: url,
        format,
        geojson,
      });
    }
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
