<template>
  <slot
    name="button"
    :show="!!showValue"
    :disabled="!!props.disabled"
    :title="title"
    :toggle="onToggleShow"
  >
    <RegistryItem
      :componentKey="toggleShowButtonKey"
      :defaultComponent="ToggleShowButton"
      :mapId="mapId"
      :show="!!showValue"
      :disabled="props.disabled"
      :title="title"
      v-bind="$attrs"
      @toggle="onToggleShow"
    />
  </slot>
</template>
<script setup lang="ts">
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem } from '@hungpvq/vue-map-core';
import ToggleShowButton from './toggle-show-button.vue';
import type { WithLayerItemActionType } from './types';
import { useToggleShowAction } from './use-toggle-show';

defineOptions({ inheritAttrs: false });

const toggleShowButtonKey = LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton;
const props = defineProps<WithLayerItemActionType>();
const { mapId, showValue, title, onToggleShow } = useToggleShowAction(props);
</script>
