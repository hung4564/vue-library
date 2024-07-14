<template lang="">
  <button v-bind="$attrs" class="menu-item" :title="item.name">
    <template v-if="item.icon">
      <component
        v-if="!isString"
        :is="item.icon()"
        :item="data"
        :mapId="mapId"
      ></component>
      <SvgIcon size="14" type="mdi" :path="item.icon" v-else
    /></template>
  </button>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { IListView, MenuItem } from '@hungpvq/vue-map-core';
import { computed } from 'vue';

const props = defineProps<{ item: MenuItem; data: IListView; mapId: string }>();
const isString = computed(() => {
  return typeof props.item.icon === 'string';
});
</script>
<style lang=""></style>
