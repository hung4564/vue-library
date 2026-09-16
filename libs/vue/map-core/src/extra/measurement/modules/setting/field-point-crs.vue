<script setup lang="ts">
import type { IViewSettingField } from '@hungpvq/map-core/measurement';
import {
  CRS_CONTROL_LOCALE,
  buildMapCrsCatalog,
  formatCrsLabel,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDeleteOutline } from '@mdi/js';
import { computed } from 'vue';
import { MapControlButton, MapCopyButton } from '../../../../components';
import { useLang } from '../../../../extra/lang/hook';
import { useMap } from '../../../../hooks/useMap';
import {
  useMapCrsDisplayEpsgs,
  useMapCrsItems,
} from '../../../crs/hooks/useMapCrsItems';

const props = withDefaults(
  defineProps<{
    fields?: IViewSettingField[];
  }>(),
  {
    fields: () => [],
  },
);

const emit = defineEmits<{
  change: [];
}>();

const { mapId } = useMap();
const { trans, setLocaleDefault } = useLang(mapId.value);
const { items: crsItems } = useMapCrsItems(mapId.value);
const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId.value);

setLocaleDefault(CRS_CONTROL_LOCALE);

const catalog = computed(() => buildMapCrsCatalog(crsItems.value));
const displayItems = computed(() =>
  resolveCrsDisplayItems(displayEpsgs.value, catalog.value),
);

const valueByEpsg = computed(() => {
  const map = new Map<string, string>();
  for (const field of props.fields) {
    const raw = String(field.text ?? field.trans ?? '');
    const match = raw.match(/(\d{3,7})/);
    if (!match) continue;
    map.set(match[1], String(field.value ?? ''));
  }
  return map;
});

const rows = computed(() =>
  displayItems.value.map((item) => ({
    epsg: item.epsg,
    title: formatCrsLabel(item),
    value: valueByEpsg.value.get(item.epsg) || '—',
    removable: item.epsg !== '4326',
  })),
);

function onRemove(epsg: string) {
  if (epsg === '4326') return;
  setDisplayEpsgs(displayEpsgs.value.filter((code) => code !== epsg));
  emit('change');
}
</script>

<template>
  <div class="map-measurement-point-crs">
    <div
      v-for="row in rows"
      :key="row.epsg"
      class="map-measurement-point-crs__row"
    >
      <span class="map-measurement-point-crs__epsg" :title="row.title"
        >EPSG:{{ row.epsg }}</span
      >
      <span class="map-measurement-point-crs__value">{{ row.value }}</span>
      <div class="map-measurement-point-crs__actions">
        <MapCopyButton
          class="map-measurement-point-crs__action"
          :value="row.value"
          :title="trans('map.measurement.action.copy')"
          :copied-title="trans('map.measurement.action.copied')"
        />
        <MapControlButton
          v-if="row.removable"
          class="map-measurement-point-crs__action"
          variant="plain"
          size="small"
          :title="trans('map.crs-display.remove')"
          @click="onRemove(row.epsg)"
        >
          <SvgIcon :size="14" type="mdi" :path="mdiDeleteOutline" />
        </MapControlButton>
      </div>
    </div>
  </div>
</template>
