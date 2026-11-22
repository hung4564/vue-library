<template>
  <BaseButton
    v-if="isGroup || isFluid"
    v-bind="$attrs"
    :class="buttonClass"
    :variant="resolvedVariant"
    :size="resolvedSize"
    :active="active"
    :title="tooltip || title"
    :aria-label="ariaLabel"
    :aria-pressed="active"
    :disabled="disabled"
    :loading="loading"
  >
    <span class="map-control-button__content">
      <slot>
        <Icon v-if="!isFluid">
          {{ icon }}
        </Icon>
      </slot>
    </span>
  </BaseButton>
  <div
    v-else
    class="button-container"
  >
    <div :title="tooltip || title">
      <slot name="content">
        <BaseButton
          v-bind="$attrs"
          :class="buttonClass"
          :variant="resolvedVariant"
          :size="resolvedSize"
          :active="active"
          :loading="loading"
          :disabled="disabled"
          :aria-label="ariaLabel"
          :aria-pressed="active"
        >
          <span class="map-control-button__content">
            <slot>
              <Icon>
                {{ icon }}
              </Icon>
            </slot>
          </span>
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script>
import {
  isMapButtonFluidVariant,
  isMapButtonSize,
  isMapButtonVariant,
  mapButtonSizeClass,
  mapButtonVariantClass,
} from '@hungpvq/map-core';
import { BaseButton, Icon } from '@hungpvq/vue-ui-core';

export default {
  name: 'MapControlButton',
  components: { BaseButton, Icon },
  // Keep `class` / listeners on BaseButton — not on the square `.button-container`
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
     * @see @hungpvq/map-core map-button helpers
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
    resolvedVariant() {
      return this.isGroup && !this.isFluid ? 'icon' : this.variant;
    },
    ariaLabel() {
      return this.tooltip || this.title;
    },
    buttonClass() {
      return [
        'map-control-button',
        mapButtonVariantClass(this.resolvedVariant),
        mapButtonSizeClass(this.resolvedSize),
        {
          'map-control-button-active': this.active,
          'map-control-button-disabled': this.disabled,
        },
      ];
    },
  },
};
</script>
