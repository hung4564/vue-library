<template>
  <p
    v-if="!options.length && emptyHintKey"
    class="map-col-12 create-control-status"
  >
    {{ trans(emptyHintKey) }}
  </p>
  <div v-else-if="options.length" class="map-col-12">
    <div class="create-control-section-label">
      {{ trans('map.layer-control.field.source-layers') }}
    </div>
    <p class="create-control-status">
      {{ trans('map.layer-control.create.source-layers-hint') }}
    </p>
    <div class="create-control-actions" style="gap: 8px; margin-bottom: 8px">
      <MapControlButton type="button" variant="outlined" @click="setAll(true)">
        {{ trans('map.layer-control.create.source-layers-all') }}
      </MapControlButton>
      <MapControlButton type="button" variant="outlined" @click="setAll(false)">
        {{ trans('map.layer-control.create.source-layers-none') }}
      </MapControlButton>
    </div>
    <div
      v-for="(opt, index) in options"
      :key="opt.id"
      class="create-control-source-layer"
    >
      <InputCheckbox
        :model-value="opt.enabled"
        :label="opt.id"
        @update:model-value="(v) => onToggle(index, v)"
      />
      <p v-if="opt.description" class="create-control-status">
        {{ opt.description }}
      </p>
      <ul
        v-if="optionMetaChips(opt).length"
        class="create-control-loaded__meta"
      >
        <li
          v-for="chip in optionMetaChips(opt)"
          :key="chip"
          class="create-control-loaded__chip"
        >
          {{ chip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { buildSourceLayerOptionMetaChips } from '@hungpvq/map-dataset/create-control';
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import { InputCheckbox } from '@hungpvq/vue-map-core/fields';

const props = defineProps({
  options: { type: Array, default: () => [] },
  emptyHintKey: { type: String, default: '' },
});

const emit = defineEmits(['update:options']);

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

function optionMetaChips(opt) {
  return buildSourceLayerOptionMetaChips(opt, {
    featuresCount: trans.value('map.layer-control.create.features-count'),
    geometry: trans.value('map.layer-control.create.source-layer-geometry'),
    fields: trans.value('map.layer-control.create.source-layer-fields'),
  });
}

function onToggle(index, enabled) {
  emit(
    'update:options',
    props.options.map((o, i) =>
      i === index ? { ...o, enabled: !!enabled } : o,
    ),
  );
}

function setAll(enabled) {
  emit(
    'update:options',
    props.options.map((o) => ({ ...o, enabled })),
  );
}
</script>

<style scoped>
.create-control-source-layer {
  margin-bottom: 10px;
}
.create-control-source-layer .create-control-loaded__meta {
  margin: 4px 0 0 28px;
}
</style>
