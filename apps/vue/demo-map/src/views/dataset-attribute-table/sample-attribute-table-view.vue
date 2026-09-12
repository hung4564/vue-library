<script setup lang="ts">
import { ATTRIBUTE_TABLE_COMPONENT_KEY } from '@hungpvq/map-dataset/attribute-table';
import type { AttributeTableViewProps } from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { computed, ref, watch } from 'vue';

defineOptions({ name: 'SampleAttributeTableView' });

const props = defineProps<AttributeTableViewProps>();

const tick = ref(0);
watch(
  () => props.controller,
  (controller, _prev, onCleanup) => {
    tick.value += 1;
    onCleanup(
      controller.subscribe(() => {
        tick.value += 1;
      }),
    );
  },
  { immediate: true },
);

const state = computed(() => {
  tick.value;
  return props.controller.getState();
});

const selected = computed(() => new Set(state.value.selectedIds));

function onRowClick(id: string) {
  void props.controller.selectIds(
    selected.value.has(id)
      ? state.value.selectedIds.filter((x) => x !== id)
      : [...state.value.selectedIds, id],
  );
}
</script>

<template>
  <div class="sample-at-view">
    <div class="sample-at-view__banner">
      <code>{{ ATTRIBUTE_TABLE_COMPONENT_KEY.view }}</code>
      · replaces toolbar + grid + pager
    </div>
    <div class="sample-at-view__toolbar">
      <input
        :value="state.search"
        :placeholder="props.labels.search"
        @input="
          props.controller.setSearch(
            ($event.target as HTMLInputElement).value,
          )
        "
      />
      <MapControlButton
        variant="outlined"
        size="small"
        @click="props.controller.clearSelection()"
      >
        {{ props.labels.clear }}
      </MapControlButton>
      <MapControlButton
        variant="outlined"
        size="small"
        @click="props.onExportClick($event)"
      >
        {{
          state.selectedIds.length
            ? props.labels.exportSelected
            : props.labels.export
        }}
      </MapControlButton>
    </div>
    <div v-if="state.loading" class="sample-at-view__status">
      {{ props.labels.loading }}
    </div>
    <div v-else-if="!state.rows.length" class="sample-at-view__status">
      {{ props.labels.empty }}
    </div>
    <table v-else class="sample-at-view__table">
      <thead>
        <tr>
          <th></th>
          <th v-for="col in state.columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in state.rows"
          :key="row.id"
          :class="{ 'is-selected': selected.has(row.id) }"
          @click="onRowClick(row.id)"
        >
          <td>
            <input
              type="checkbox"
              :checked="selected.has(row.id)"
              @click.stop="onRowClick(row.id)"
            />
          </td>
          <td v-for="col in state.columns" :key="col.key">
            {{ row.cells[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="sample-at-view__pager">
      <span>
        {{ props.labels.page }} {{ state.page }} {{ props.labels.of }}
        {{ props.controller.getTotalPages() }}
      </span>
      <MapControlButton
        variant="outlined"
        size="small"
        :disabled="!props.controller.canPrev()"
        @click="props.controller.goPrev()"
      >
        {{ props.labels.prev }}
      </MapControlButton>
      <MapControlButton
        variant="outlined"
        size="small"
        :disabled="!props.controller.canNext()"
        @click="props.controller.goNext()"
      >
        {{ props.labels.next }}
      </MapControlButton>
    </div>
  </div>
</template>

<style scoped>
.sample-at-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-size: 12px;
}
.sample-at-view__banner {
  padding: 4px 10px;
  background: #f3f0e8;
  border-bottom: 1px solid #d9d0bc;
  color: #3d3426;
}
.sample-at-view__banner code {
  font-size: 10px;
}
.sample-at-view__toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e5e5;
}
.sample-at-view__toolbar input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
}
.sample-at-view__status {
  padding: 24px;
  text-align: center;
  opacity: 0.7;
}
.sample-at-view__table {
  flex: 1;
  width: 100%;
  border-collapse: collapse;
  overflow: auto;
  display: block;
}
.sample-at-view__table th,
.sample-at-view__table td {
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
  white-space: nowrap;
}
.sample-at-view__table tr.is-selected {
  background: #e8f1fb;
}
.sample-at-view__pager {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid #e5e5e5;
}
</style>
