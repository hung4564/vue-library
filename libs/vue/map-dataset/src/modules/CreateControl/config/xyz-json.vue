<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <DataSourceTabs v-model:active-tab="activeDataTab" :tabs="dataTabs">
        <template #raw>
          <input-text
            v-model="form.url"
            :label="trans('map.layer-control.field.url')"
            @update:model-value="onRawUrlChange"
          />
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
  useLang,
  useMap,
} from '@hungpvq/vue-map-core';
import {
  applyCreateControlSample,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  getCreateControlDataTabs,
  getCreateControlSampleUrl,
  getCreateControlSamples,
} from '@hungpvq/map-dataset';
import { computed, ref } from 'vue';
import DataSourceTabs from './DataSourceTabs.vue';

const form = defineModel();
const sampleId = ref('');
const dataUrl = ref('');
const loadingUrl = ref(false);
const urlError = ref('');

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const dataTabs = getCreateControlDataTabs('rasterxyz');
const activeDataTab = ref(CREATE_CONTROL_DEFAULT_DATA_TAB);

const sampleItems = computed(() => [
  { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
  ...getCreateControlSamples('rasterxyz').map((item) => ({
    value: item.id,
    text: item.label,
  })),
]);

function onRawUrlChange(url) {
  sampleId.value = '';
  dataUrl.value = '';
  urlError.value = '';
  form.value.tiles = url ? [url] : [];
}

function onSelectSample(id) {
  const nextId = typeof id === 'string' ? id : '';
  sampleId.value = nextId;
  urlError.value = '';
  if (!nextId) return;

  const sample = getCreateControlSamples('rasterxyz').find(
    (item) => item.id === nextId,
  );
  if (!sample) return;
  dataUrl.value = getCreateControlSampleUrl(sample);
}

function onUrlInput() {
  urlError.value = '';
  const trimmed = dataUrl.value.trim();
  const sample = getCreateControlSamples('rasterxyz').find(
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
  try {
    const sample = getCreateControlSamples('rasterxyz').find(
      (item) =>
        item.id === sampleId.value && getCreateControlSampleUrl(item) === url,
    );
    if (sample) {
      const patch = await applyCreateControlSample(sample);
      Object.assign(form.value, patch);
      form.value.name = sample.label;
    } else {
      form.value.url = url;
      form.value.tiles = [url];
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
</script>
