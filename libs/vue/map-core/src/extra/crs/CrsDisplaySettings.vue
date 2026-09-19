<script setup lang="ts">

import {
  buildMapCrsCatalog,
  formatCrsLabel,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
  resolveCrsItemForStore,
} from '@hungpvq/map-core/crs';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose } from '@mdi/js';
import { computed, ref, watch } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang } from '../lang/hook';
import { InputCrs } from '../../field';
import { useMap } from '../../hooks/useMap';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from './useMapCrsItems';

const props = withDefaults(
  defineProps<{
    /**
     * Dense layout for measurement setting:
     * selected CRS are rendered elsewhere; this block is add-input only.
     */
    compact?: boolean;
  }>(),
  { compact: false },
);

const emit = defineEmits<{
  change: [];
}>();

const { mapId } = useMap();
const { trans } = useLang(mapId.value);
const { items: crsItems, setItems } = useMapCrsItems(mapId.value);
const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId.value);
const draftEpsg = ref('');
const inputKey = ref(0);

const catalog = computed(() => buildMapCrsCatalog(crsItems.value));
const displayItems = computed(() =>
  resolveCrsDisplayItems(displayEpsgs.value, catalog.value),
);
const availableItems = computed(() =>
  catalog.value.filter((item) => !displayEpsgs.value.includes(item.epsg)),
);

function tryAdd(raw: string) {
  const epsg = normalizeEpsgCode(raw);
  if (!epsg || displayEpsgs.value.includes(epsg)) return false;

  const resolved = resolveCrsItemForStore(epsg, crsItems.value);
  if (resolved) {
    setItems([...crsItems.value, resolved]);
  } else if (!catalog.value.some((item) => item.epsg === epsg)) {
    return false;
  }

  setDisplayEpsgs([...displayEpsgs.value, epsg]);
  emit('change');
  return true;
}

function onAdd() {
  if (!tryAdd(draftEpsg.value)) return;
  draftEpsg.value = '';
  inputKey.value += 1;
}

function onRemove(epsg: string) {
  if (epsg === '4326') return;
  setDisplayEpsgs(displayEpsgs.value.filter((code) => code !== epsg));
  emit('change');
}

watch(draftEpsg, (value) => {
  if (!props.compact || !value) return;
  if (!tryAdd(value)) return;
  draftEpsg.value = '';
  inputKey.value += 1;
});
</script>

<template>
  <div
    class="crs-display-settings"
    :class="{ 'crs-display-settings--compact': compact }"
  >
    <div class="crs-display-settings__title">
      {{
        compact
          ? trans('map.crs-display.title-short')
          : trans('map.crs-display.title')
      }}
    </div>

    <div v-if="compact" class="crs-display-settings__add">
      <InputCrs
        :key="inputKey"
        v-model="draftEpsg"
        :items="availableItems"
        :placeholder="trans('map.crs-display.add')"
      />
    </div>

    <template v-else>
      <ul class="crs-display-settings__list">
        <li
          v-for="item in displayItems"
          :key="item.epsg"
          class="crs-display-settings__item"
        >
          <span class="crs-display-settings__label">{{
            formatCrsLabel(item)
          }}</span>
          <MapControlButton
            v-if="item.epsg !== '4326'"
            class="crs-display-settings__remove"
            variant="plain"
            size="small"
            :title="trans('map.crs-display.remove')"
            @click="onRemove(item.epsg)"
          >
            <SvgIcon :size="14" type="mdi" :path="mdiClose" />
          </MapControlButton>
        </li>
      </ul>
      <div class="crs-display-settings__add">
        <InputCrs v-model="draftEpsg" :items="availableItems" />
        <MapControlButton
          class="crs-display-settings__add-btn"
          variant="text"
          :title="trans('map.crs-display.add')"
          @click="onAdd"
        >
          {{ trans('map.crs-display.add') }}
        </MapControlButton>
      </div>
    </template>
  </div>
</template>
