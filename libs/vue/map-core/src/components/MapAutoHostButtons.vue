<template>
  <MapCommonButton
    v-if="mode === 'single' && singleState"
    :option="singleState"
    @click.stop="onSingleClick"
  />
  <MapControlGroupButton
    v-else-if="mode === 'module'"
    :row="row"
  >
    <MapCommonButton
      v-for="[id, btn] in moduleEntries"
      v-show="btn?.visible != false"
      :key="id"
      :option="btn"
      @click.stop="onModuleClick(id, $event)"
    />
  </MapControlGroupButton>
  <MapControlGroupButton
    v-else-if="mode === 'expandable' && launcher"
    :row="row"
    class="map-host-expandable"
  >
    <template v-if="expandRight">
      <MapCommonButton
        v-if="launcher.visible != false"
        :option="launcher"
        @click.stop="onModuleClick('launcher', $event)"
      />
      <template v-if="launcher.active">
        <MapCommonButton
          v-for="[id, btn] in optionEntries"
          v-show="btn?.visible != false"
          :key="id"
          :option="btn"
          @click.stop="onModuleClick(id, $event)"
        />
      </template>
    </template>
    <template v-else>
      <template v-if="launcher.active">
        <MapCommonButton
          v-for="[id, btn] in optionEntries"
          v-show="btn?.visible != false"
          :key="id"
          :option="btn"
          @click.stop="onModuleClick(id, $event)"
        />
      </template>
      <MapCommonButton
        v-if="launcher.visible != false"
        :option="launcher"
        @click.stop="onModuleClick('launcher', $event)"
      />
    </template>
  </MapControlGroupButton>
</template>

<script lang="ts">
export default {
  name: 'MapAutoHostButtons',
};
</script>

<script setup lang="ts">
import type { Position } from '@hungpvq/map-core';
import type { MapControlButtonUIState } from '@hungpvq/map-core/toolbar';
import { computed } from 'vue';

import { defineProps } from 'vue';
import MapCommonButton from './MapCommonButton.vue';
import MapControlGroupButton from './MapControlGroupButton.vue';

const props = defineProps<{
  state: unknown;
  position?: Position | string;
  onAction: (...args: unknown[]) => void;
}>();

function isButtonRecord(
  value: unknown,
): value is Record<string, MapControlButtonUIState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const vals = Object.values(value as Record<string, unknown>);
  if (vals.length === 0) return false;
  return vals.every(
    (v) => v != null && typeof v === 'object' && !Array.isArray(v),
  );
}

const mode = computed<'single' | 'module' | 'expandable' | 'empty'>(() => {
  if (!props.state) return 'empty';
  if (!isButtonRecord(props.state)) return 'single';
  return 'launcher' in props.state ? 'expandable' : 'module';
});

const singleState = computed(() =>
  mode.value === 'single'
    ? (props.state as MapControlButtonUIState)
    : undefined,
);

const recordState = computed(() =>
  isButtonRecord(props.state) ? props.state : undefined,
);

const launcher = computed(() => recordState.value?.launcher);

const moduleEntries = computed(() => {
  const state = recordState.value;
  if (!state) return [] as [string, MapControlButtonUIState][];
  return Object.entries(state);
});

const optionEntries = computed(() => {
  const state = recordState.value;
  if (!state) return [] as [string, MapControlButtonUIState][];
  return Object.entries(state).filter(
    ([id, btn]) => id !== 'launcher' && btn?.role === 'option',
  );
});

const expandRight = computed(() =>
  String(props.position ?? '').endsWith('left'),
);

const row = computed(() => {
  const state = recordState.value;
  if (!state) return true;
  const sample = state.launcher ?? Object.values(state)[0];
  return sample?.orientation === 'row';
});

function onSingleClick(event: MouseEvent) {
  props.onAction(event);
}

function onModuleClick(id: string, event: MouseEvent) {
  props.onAction(id, event);
}
</script>
