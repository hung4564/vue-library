<template>
  <button
    type="button"
    class="map-control-button"
    :style="bindStyle"
    :disabled="disabled"
    v-bind="$attrs"
    :class="{
      'map-control-button-active': active,
      'map-control-button-disabled': disabled,
    }"
  >
    <span class="map-control-button__content">
      <SvgIcon
        :size="(height * 2) / 3"
        type="mdi"
        :path="path.loading"
        v-if="loading"
        class="spin"
      />
      <slot v-else />
    </span>
  </button>
</template>

<script lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiLoading } from '@mdi/js';
export default {
  name: 'MapButton',
  components: { SvgIcon },
  props: {
    height: { default: 32 },
    width: { default: 32 },
    loading: Boolean,
    active: Boolean,
    disabled: Boolean,
  },
  computed: {
    bindStyle() {
      return { width: `${this.width}px`, height: `${this.height}px` };
    },
    path() {
      return { loading: mdiLoading };
    },
  },
};
</script>
