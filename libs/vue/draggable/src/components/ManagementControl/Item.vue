<template>
  <span :title="title"> {{ title }} </span>
</template>

<script setup lang="ts">
import { useDragContainer } from '../../store';

const props = defineProps<{
  item: string;
  containerId: string;
}>();
const { getItemAction } = useDragContainer(props.containerId);
const title = getItemAction(props.item).title || props.item;
</script>

<style scoped></style>
