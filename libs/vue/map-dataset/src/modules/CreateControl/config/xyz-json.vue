<template>
  <div class="map-row create-control-settings">
    <div class="map-col-12">
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
    </div>
  </div>
</template>

<script setup>
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import { InputActionRow, InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import {
  CREATE_CONTROL_SAMPLE_NONE,
  getCreateControlSamples,
  loadCreateControlVectorTileFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
} from '@hungpvq/map-dataset/create-control';
import { computed, ref } from 'vue';

const form = defineModel();
const sampleId = ref('');
const dataUrl = ref('');
const loadingUrl = ref(false);
const urlError = ref('');

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

const sampleItems = computed(() => [
  { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
  ...getCreateControlSamples('xyz').map((item) => ({
    value: item.id,
    text: item.label,
  })),
]);

function onSelectSample(id) {
  const nextId = typeof id === 'string' ? id : '';
  sampleId.value = nextId;
  urlError.value = '';
  const url = resolveCreateControlSampleSelection('xyz', nextId);
  if (url != null) dataUrl.value = url;
}

function onUrlInput() {
  urlError.value = '';
  sampleId.value = resolveCreateControlSampleIdAfterUrlEdit(
    'xyz',
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
    const { patch } = await loadCreateControlVectorTileFromUrl({
      url,
      sampleId: sampleId.value,
      currentName: form.value.name,
      layerKind: 'xyz',
    });
    Object.assign(form.value, patch);
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
