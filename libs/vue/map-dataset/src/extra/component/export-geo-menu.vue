<template>
  <li
    class="layer-context-menu__item layer-context-menu__item--has-children"
    :class="{ 'is-open': open }"
    @click.stop="open = !open"
  >
    <div class="layer-context-menu__item-icon">
      <SvgIcon size="16" type="mdi" :path="mdiDownload" />
    </div>
    <span>{{ 'name' in item ? item.name : 'Export' }}</span>
    <div class="layer-context-menu__chevron">
      <SvgIcon size="16" type="mdi" :path="mdiChevronRight" />
    </div>
    <ul class="context-menu layer-context-menu layer-context-menu--submenu">
      <li
        v-for="fmt in formats"
        :key="fmt"
        class="layer-context-menu__item"
        @click.stop="onFormat(fmt)"
      >
        <div class="layer-context-menu__item-icon">
          <SvgIcon size="16" type="mdi" :path="mdiDownload" />
        </div>
        <span>{{ GEO_EXPORT_FORMAT_META[fmt].name }}</span>
      </li>
    </ul>
  </li>
</template>
<script setup lang="ts">
import {
  createGeoExportController,
  GEO_EXPORT_FORMAT_META,
  GEO_EXPORT_FORMATS,
  type GeoExportFormat,
  type GeoExportOptions,
  resolveGeoExportOption,
} from '@hungpvq/map-dataset/geo-export';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronRight, mdiDownload } from '@mdi/js';
import { computed, ref } from 'vue';

import type { WithLayerItemMenuComponentType } from './types';

defineOptions({ name: 'LayerActionExportGeoMenu' });

const props = defineProps<WithLayerItemMenuComponentType>();
const emit = defineEmits<{ close: [] }>();
const open = ref(false);

const menuExtra = computed(() => props.item as Record<string, unknown>);

const formats = computed((): GeoExportFormat[] => {
  const fromItem = menuExtra.value.formats as GeoExportFormat[] | undefined;
  if (fromItem?.length) return fromItem;
  const resolved = props.data ? resolveGeoExportOption(props.data) : undefined;
  return resolved?.formats?.length ? resolved.formats : [...GEO_EXPORT_FORMATS];
});

async function onFormat(format: GeoExportFormat) {
  if (!props.data) return;
  const resolved = resolveGeoExportOption(props.data, {
    ...(menuExtra.value as GeoExportOptions),
    formats: formats.value,
    uiMode: 'menu',
  });
  const ctrl = createGeoExportController(props.data, {
    ...resolved,
    mapId: props.mapId,
  });
  try {
    await ctrl.run({ format, mapId: props.mapId });
  } finally {
    ctrl.dispose();
    emit('close');
  }
}
</script>
