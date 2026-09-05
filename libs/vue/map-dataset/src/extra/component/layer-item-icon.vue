<template>
  <div
    class="layer-item__icon-content"
    :class="kindClass"
    :title="kindTitle"
  >
    <SvgIcon
      size="14"
      type="mdi"
      :path="path.loading"
      class="spin"
      v-if="loading"
    />
    <SvgIcon size="14" type="mdi" :path="iconPath" v-else />
  </div>
</template>
<script setup lang="ts">
import {
  getDatasetSourceKind,
  type DatasetSourceKind,
  type IDataset,
} from '@hungpvq/map-dataset';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCheckerboard,
  mdiLayers,
  mdiLoading,
  mdiVectorPolygon,
} from '@mdi/js';
import { computed } from 'vue';

const props = defineProps<{
  loading?: boolean;
  item?: IDataset;
  data?: IDataset;
}>();

const path: Record<DatasetSourceKind | 'loading', string> = {
  loading: mdiLoading,
  vector: mdiVectorPolygon,
  raster: mdiCheckerboard,
  unknown: mdiLayers,
};

const kind = computed(() => getDatasetSourceKind(props.data ?? props.item));
const iconPath = computed(() => path[kind.value]);
const kindClass = computed(() =>
  kind.value === 'unknown'
    ? undefined
    : `layer-item__icon-content--${kind.value}`,
);
const kindTitle = computed(() => {
  if (kind.value === 'vector') return 'Vector';
  if (kind.value === 'raster') return 'Raster';
  return undefined;
});
</script>
