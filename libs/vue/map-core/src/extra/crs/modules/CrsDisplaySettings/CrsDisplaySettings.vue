<script setup lang="ts">
import {
  buildMapCrsCatalog,
  formatCrsLabel,
  lookupCrsItem,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core';
import { computed, ref } from 'vue';
import { BaseButton, InputCrs } from '../../../../field';
import { useLang } from '../../../../extra/lang';
import { useMap } from '../../../../hooks';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from '../../hooks';

const { mapId } = useMap();
const { trans, setLocaleDefault } = useLang(mapId.value);
const { items: crsItems } = useMapCrsItems(mapId.value);
const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId.value);
const draftEpsg = ref('');

const catalog = computed(() => buildMapCrsCatalog(crsItems.value));
const displayItems = computed(() =>
  resolveCrsDisplayItems(displayEpsgs.value, catalog.value),
);

setLocaleDefault({
  map: {
    'crs-display': {
      title: 'Display coordinate systems',
      add: 'Add CRS',
      remove: 'Remove',
    },
  },
});

function onAdd() {
  const epsg = normalizeEpsgCode(draftEpsg.value);
  if (!epsg || displayEpsgs.value.includes(epsg)) return;
  if (!lookupCrsItem(epsg, catalog.value)) return;
  setDisplayEpsgs([...displayEpsgs.value, epsg]);
  draftEpsg.value = '';
}

function onRemove(epsg: string) {
  if (epsg === '4326') return;
  setDisplayEpsgs(displayEpsgs.value.filter((code) => code !== epsg));
}
</script>

<template>
  <div class="crs-display-settings">
    <div class="crs-display-settings__title">
      {{ trans('map.crs-display.title') }}
    </div>
    <ul class="crs-display-settings__list">
      <li
        v-for="item in displayItems"
        :key="item.epsg"
        class="crs-display-settings__item"
      >
        <span class="crs-display-settings__label">{{ formatCrsLabel(item) }}</span>
        <button
          v-if="item.epsg !== '4326'"
          type="button"
          class="clickable crs-display-settings__remove"
          @click="onRemove(item.epsg)"
        >
          {{ trans('map.crs-display.remove') }}
        </button>
      </li>
    </ul>
    <div class="crs-display-settings__add">
      <InputCrs v-model="draftEpsg" />
      <BaseButton class="crs-display-settings__add-btn" @click="onAdd">
        {{ trans('map.crs-display.add') }}
      </BaseButton>
    </div>
  </div>
</template>
