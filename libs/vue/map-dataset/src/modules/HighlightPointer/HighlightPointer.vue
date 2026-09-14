<script setup lang="ts">
import type { HighlightStyle } from '@hungpvq/map-dataset/highlight';
import { destroyHighlightController } from '@hungpvq/map-dataset/highlight';
import { useMap } from '@hungpvq/vue-map-core';
import { onMounted, onUnmounted, watch } from 'vue';
import { useHighlight } from '../../store/highlight';

const props = withDefaults(
  defineProps<{
    enableClick?: boolean;
    enableHover?: boolean;
    color?: string;
    durationMs?: number;
  }>(),
  {
    enableClick: false,
    enableHover: false,
  },
);

const { mapId } = useMap();
const hl = useHighlight(mapId.value);
let unbind: (() => void) | undefined;

function applyDefaults() {
  const style: HighlightStyle = {};
  if (props.color) style.color = props.color;
  if (props.durationMs != null) style.durationMs = props.durationMs;
  if (Object.keys(style).length) hl.setDefaultStyle(style);
}

onMounted(() => {
  applyDefaults();
  unbind = hl.bindPointer({
    click: props.enableClick,
    hover: props.enableHover,
  });
});

watch(
  () =>
    [props.enableClick, props.enableHover, props.color, props.durationMs] as const,
  () => {
    applyDefaults();
    unbind?.();
    unbind = hl.bindPointer({
      click: props.enableClick,
      hover: props.enableHover,
    });
  },
);

onUnmounted(() => {
  unbind?.();
  destroyHighlightController(mapId.value);
});
</script>

<template><span style="display: none" /></template>
