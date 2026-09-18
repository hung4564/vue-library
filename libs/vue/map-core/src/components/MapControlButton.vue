<template>
  <MapButton
    v-if="isGroup || isFluid"
    v-bind="$attrs"
    :variant="variant"
    :size="resolvedSize"
    :active="active"
    :title="tooltip || title"
    :aria-label="ariaLabel"
    :aria-pressed="active"
    :disabled="disabled"
    :loading="loading"
  >
    <slot>
      <MapIcon v-if="!isFluid">
        {{ icon }}
      </MapIcon>
    </slot>
  </MapButton>
  <div v-else class="button-container">
    <div :title="tooltip || title">
      <slot name="content">
        <MapButton
          v-bind="$attrs"
          variant="icon"
          :size="resolvedSize"
          :active="active"
          :loading="loading"
          :disabled="disabled"
          :aria-label="ariaLabel"
          :aria-pressed="active"
        >
          <slot>
            <MapIcon>
              {{ icon }}
            </MapIcon>
          </slot>
        </MapButton>
      </slot>
    </div>
  </div>
</template>

<script>
import MapButton from './MapButton.vue';
import MapIcon from './MapIcon.vue';
import {
  isMapButtonFluidVariant,
  isMapButtonSize,
  isMapButtonVariant,
} from '@hungpvq/map-core';

export default {
  name: 'MapControlButton',
  components: { MapButton, MapIcon },
  // Keep `class` / listeners on MapButton — not on the square `.button-container`
  // wrapper (otherwise styles like `.devtools-toggle { border }` ring the container).
  inheritAttrs: false,
  props: {
    icon: {
      type: [String, Boolean],
    },
    tooltip: String,
    title: String,
    loading: Boolean,
    /**
     * small | medium | large | number (px). Applies to every variant.
     * @default medium
     */
    size: {
      type: [String, Number],
      default: 'medium',
      validator: (v) => isMapButtonSize(v),
    },
    active: Boolean,
    disabled: Boolean,
    /**
     * icon (default) | plain | text | tonal | outlined | filled
     * @see map-button-variant.ts
     */
    variant: {
      type: String,
      default: 'icon',
      validator: (v) => isMapButtonVariant(v),
    },
  },
  inject: {
    isGroup: { default: false },
    groupSize: { default: undefined, from: 'size' },
  },
  computed: {
    isFluid() {
      return isMapButtonFluidVariant(this.variant);
    },
    resolvedSize() {
      if (this.isGroup && this.groupSize != null && this.groupSize !== '') {
        return this.groupSize;
      }
      return this.size;
    },
    ariaLabel() {
      return this.tooltip || this.title;
    },
  },
};
</script>
