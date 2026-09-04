<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <DataSourceTabs v-model:active-tab="activeDataTab" :tabs="dataTabs">
        <template #file>
          <DragDropFile
            :multiple="true"
            :accept="GIS_FILE_ACCEPT"
            @change="onChangeFile"
          />
          <p class="create-control-status">
            {{ trans('map.layer-control.create.file-hint') }}
          </p>
          <div v-if="parsing" class="create-control-status">
            {{ trans('map.layer-control.create.parsing') }}
          </div>
          <div v-if="parseError" class="create-control-sample-error">
            {{ parseError }}
          </div>
        </template>

        <template #raw>
          <InputTextArea
            :model-value="pasteText"
            rows="4"
            :label="trans('map.layer-control.create.paste-geojson')"
            :placeholder="trans('map.layer-control.create.paste-geojson-hint')"
            @update:model-value="onPasteGeojson"
          />
          <div v-if="parsing" class="create-control-status">
            {{ trans('map.layer-control.create.parsing') }}
          </div>
          <div v-if="parseError" class="create-control-sample-error">
            {{ parseError }}
          </div>
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
              {{ trans('map.layer-control.create.load') }}
            </BaseButton>
          </div>
          <div v-if="loadingUrl" class="create-control-status">
            {{ trans('map.layer-control.create.loading-url') }}
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
import {
  applyCreateControlSample,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  GIS_FILE_ACCEPT,
  getCreateControlDataTabs,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
} from '@hungpvq/map-dataset';
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
let pasteTimer;

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
  }
}

function clearUrlState() {
  sampleId.value = '';
  dataUrl.value = '';
  urlError.value = '';
}

async function onChangeFile(input) {
  const files = Array.isArray(input) ? input : input ? [input] : [];
  parsing.value = true;
  clearUrlState();
  parseError.value = '';
  try {
    pasteText.value = '';
    const { geojson, crs } = await loadGisFileAsync(files);
    syncGeojsonPreview(geojson, crs);
    activeDataTab.value = CREATE_CONTROL_DEFAULT_DATA_TAB;
  } catch (err) {
    parseError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.parse-error');
    syncGeojsonPreview(null);
  } finally {
    parsing.value = false;
  }
}

function onPasteGeojson(text) {
  pasteText.value = text;
  clearUrlState();
  parseError.value = '';
  clearTimeout(pasteTimer);
  if (!text.trim()) {
    syncGeojsonPreview(null);
    return;
  }
  pasteTimer = setTimeout(async () => {
    parsing.value = true;
    try {
      const { geojson, crs } = await loadGisTextAsync(text);
      parseError.value = '';
      if (geojson) syncGeojsonPreview(geojson, crs);
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
    if (sample) {
      const patch = await applyCreateControlSample(sample);
      Object.assign(form.value, patch);
      form.value.name = sample.label;
      syncGeojsonPreview(patch.geojson ?? null, patch.crs);
    } else {
      const { geojson, crs } = await loadGisUrlAsync(url);
      syncGeojsonPreview(geojson, crs);
    }
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
});
</script>
