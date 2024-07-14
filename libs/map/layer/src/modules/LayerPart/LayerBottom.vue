<script lang="ts">
export default {
  name: 'layer-item-bottom',
};
</script>
<script setup lang="ts">
import { IListView } from '@hungpvq/vue-map-core';

const props = defineProps<{ item: IListView }>();
const bottomLayerItem = `layer-item-${props.item.id}-bottom`;
</script>
<template lang="">
  <Teleport :to="`#${bottomLayerItem}`"> <slot /> </Teleport>
</template>
