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
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import { InputActionRow, InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import {
  applyCreateControlSample,
  applyCreateControlLayerName,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  findCreateControlSampleMatchingUrl,
  getCreateControlDataTabs,
  getCreateControlSamples,
  layerNameFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
} from '@hungpvq/map-dataset/create-control';
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
  const url = resolveCreateControlSampleSelection('rasterxyz', nextId);
  if (url != null) dataUrl.value = url;
}

function onUrlInput() {
  urlError.value = '';
  sampleId.value = resolveCreateControlSampleIdAfterUrlEdit(
    'rasterxyz',
    sampleId.value,
    dataUrl.value,
  );
}

async function onLoadUrl() {
  const url = dataUrl.value.trim();
  if (!url) return;

  loadingUrl.value = true;
  urlError.value = '';
  try {
    const sample = findCreateControlSampleMatchingUrl(
      'rasterxyz',
      sampleId.value,
      url,
    );
    if (sample) {
      const patch = await applyCreateControlSample(sample);
      Object.assign(form.value, patch);
      form.value.name = applyCreateControlLayerName(
        form.value.name,
        sample.label,
        'rasterxyz',
      );
    } else {
      form.value.url = url;
      form.value.tiles = [url];
      form.value.name = applyCreateControlLayerName(
        form.value.name,
        layerNameFromUrl(url),
        'rasterxyz',
      );
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
