<script setup lang="ts">
import type { DataManagementPart } from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import {
  BaseMapCard,
  BaseMapControl,
  EventManagementControl,
  Map,
  WorkerControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { reactive, ref } from 'vue';
import { loadDataManagementDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';

const mapId = ref(getUUIDv4());

type PagerState = {
  label: string;
  page: number;
  pageSize: number;
  total: number;
  names: string[];
  part?: DataManagementPart;
};

const pagers = reactive<PagerState[]>([
  {
    label: 'HTTP standard `{ data, meta }`',
    page: 1,
    pageSize: 5,
    total: 0,
    names: [],
  },
  {
    label: 'HTTP custom `parseList` / `parseItem`',
    page: 1,
    pageSize: 5,
    total: 0,
    names: [],
  },
]);

async function refreshPager(state: PagerState) {
  if (!state.part) return;
  const result = await state.part.list({
    page: state.page,
    pageSize: state.pageSize,
  });
  state.total = result.total;
  state.names = result.items.map((r) => String(r.name ?? r.id));
}

async function onMapLoaded(map: MapSimple) {
  const result = await loadDataManagementDemoDatasets(map.id);
  pagers[0].part = result.standardHttp;
  pagers[1].part = result.customHttp;
  await Promise.all(pagers.map((p) => refreshPager(p)));
}

async function prev(state: PagerState) {
  if (state.page <= 1) return;
  state.page -= 1;
  await refreshPager(state);
}

async function next(state: PagerState) {
  const max = Math.ceil(state.total / state.pageSize) || 1;
  if (state.page >= max) return;
  state.page += 1;
  await refreshPager(state);
}
</script>

<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl
      position="bottom-left"
      default-base-map="Google Satellite"
    />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId: mid }">
        <BaseMapCard :mapId="mid" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
    <EventManagementControl position="top-left" />
    <IdentifyControl position="top-right" />
    <WorkerControl position="top-left" />

    <div class="dm-panel">
      <section
        v-for="state in pagers"
        :key="state.label"
        class="dm-card dm-card--pager"
      >
        <strong>{{ state.label }}</strong>
        <div class="dm-card__names">
          {{ state.names.join(', ') || '(empty)' }}
        </div>
        <div>
          page {{ state.page }} / total {{ state.total }}
          <button type="button" @click="prev(state)">Prev</button>
          <button type="button" @click="next(state)">Next</button>
        </div>
      </section>
    </div>
  </Map>
</template>

<style>
.dm-panel {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(380px, calc(100vw - 24px));
  max-height: calc(100% - 24px);
  overflow: auto;
}
.dm-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.dm-card__meta {
  margin: 6px 0 0;
  opacity: 0.85;
  font-size: 11px;
  line-height: 1.4;
}
.dm-card--pager button {
  font: inherit;
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
}
.dm-card__names {
  margin: 4px 0;
  word-break: break-word;
}
</style>
