<template>
  <MapControlButton
    :title="option.title"
    :class="{ active: option.active }"
    :disabled="option.disabled"
    v-bind="$attrs"
    :loading="option.loading"
    v-if="option.visible != false"
  >
    <template v-if="option.icon?.type === 'compass'">
      <svg
        height="22"
        :style="{ transform: option.icon.transform }"
        viewBox="0 0 24 24"
        width="22"
      >
        <g fill="none" fill-rule="evenodd">
          <path d="M0 0h24v24H0z"></path>
          <path d="M12 3l4 8H8z" fill="#f44336"></path>
          <path d="M12 21l-4-8h8z" fill="#9E9E9E"></path>
        </g>
      </svg>
    </template>

    <SvgIcon
      v-else-if="option.icon?.type === 'mdi'"
      :size="18"
      type="mdi"
      :path="option.icon.path"
    />
  </MapControlButton>
</template>

<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { MapControlButtonUIState } from '../extra';
import MapControlButton from './MapControlButton.vue';
defineProps<{ option: MapControlButtonUIState }>();
defineOptions({
  name: 'map-common-button',
});
</script>
