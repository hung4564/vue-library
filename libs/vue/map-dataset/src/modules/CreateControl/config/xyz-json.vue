<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
      <DataSourceTabs v-model:active-tab="activeDataTab" :tabs="dataTabs">
        <template #raw>
          <input-text
            v-model="form.url"
            :label="trans('map.layer-control.field.url')"
            @update:model-value="onUrlChange"
          />
        </template>

        <template #sample>
          <InputSelect
            :model-value="sampleId"
            :items="sampleItems"
            :label="trans('map.layer-control.create.sample')"
            @update:model-value="onSelectSample"
          />
          <div v-if="loadingSample" class="create-control-status">
            {{ trans('map.layer-control.create.loading-sample') }}
          </div>
          <div v-if="sampleError" class="create-control-sample-error">
            {{ sampleError }}
          </div>
        </template>
      </DataSourceTabs>
    </div>
  </div>
</template>

<script setup>
import { InputSelect, InputText, useLang, useMap } from '@hungpvq/vue-map-core';
import {
  applyCreateControlSample,
  CREATE_CONTROL_SAMPLE_NONE,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  getCreateControlDataTabs,
  getCreateControlSamples,
} from '@hungpvq/map-dataset';
import { computed, ref } from 'vue';
import DataSourceTabs from './DataSourceTabs.vue';

const form = defineModel();
const sampleId = ref('');
const loadingSample = ref(false);
const sampleError = ref('');

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

function onUrlChange(url) {
  sampleId.value = '';
  sampleError.value = '';
  form.value.tiles = url ? [url] : [];
}

async function onSelectSample(id) {
  const nextId = typeof id === 'string' ? id : '';
  sampleId.value = nextId;
  sampleError.value = '';
  if (!nextId) return;

  const sample = getCreateControlSamples('rasterxyz').find((item) => item.id === nextId);
  if (!sample) return;

  loadingSample.value = true;
  try {
    const patch = await applyCreateControlSample(sample);
    Object.assign(form.value, patch);
    form.value.name = sample.label;
    activeDataTab.value = CREATE_CONTROL_DEFAULT_DATA_TAB;
  } catch (err) {
    sampleError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.sample-error');
  } finally {
    loadingSample.value = false;
  }
}
</script>
