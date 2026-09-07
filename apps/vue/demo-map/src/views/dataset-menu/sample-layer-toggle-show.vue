<template>
  <ToggleShow
    :item="item"
    :data="data"
    :mapId="mapId"
    :disabled="disabled"
    :location="location"
  >
    <template #button="{ show, disabled: isDisabled, title, toggle }">
      <BaseButton
        :disabled="isDisabled"
        :title="title"
        :active="show"
        @click.stop="toggle"
      >
        <input
          class="sample-layer-toggle-show__checkbox"
          type="checkbox"
          :checked="show"
          :disabled="isDisabled"
          tabindex="-1"
          @click.prevent
        />
      </BaseButton>
    </template>
  </ToggleShow>
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction, MenuActionLocation } from '@hungpvq/map-dataset';
import { BaseButton } from '@hungpvq/vue-map-core';
import { ToggleShow } from '@hungpvq/vue-map-dataset';

defineOptions({ name: 'SampleLayerToggleShow', inheritAttrs: false });

defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
  location?: MenuActionLocation;
}>();
</script>
<style scoped>
.sample-layer-toggle-show__checkbox {
  pointer-events: none;
  margin: 0;
  cursor: inherit;
}
</style>
