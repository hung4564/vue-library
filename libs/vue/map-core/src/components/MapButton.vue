<template>
  <button
    type="button"
    class="map-control-button"
    :style="bindStyle"
    :disabled="disabled"
    v-bind="$attrs"
    :class="[
      variantClass,
      sizeClass,
      {
        'map-control-button-active': active,
        'map-control-button-disabled': disabled,
      },
    ]"
  >
    <span class="map-control-button__content">
      <SvgIcon
        :size="spinnerSize"
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
import {
  isMapButtonSize,
  isMapButtonSquareVariant,
  isMapButtonVariant,
  mapButtonSizeClass,
  mapButtonVariantClass,
  resolveMapButtonSizePx,
  type MapButtonSize,
  type MapButtonVariant,
} from './map-button-variant';

export default {
  name: 'MapButton',
  components: { SvgIcon },
  props: {
    /**
     * small | medium | large | number (px). Applies to every variant.
     * @see map-button-variant.ts
     */
    size: {
      type: [String, Number],
      default: 'medium',
      validator: (v: unknown) => isMapButtonSize(v),
    },
    loading: Boolean,
    active: Boolean,
    disabled: Boolean,
    /**
     * icon | plain | text | tonal | outlined | filled
     * @see map-button-variant.ts
     */
    variant: {
      type: String,
      default: 'icon',
      validator: (v: string) => isMapButtonVariant(v),
    },
  },
  computed: {
    typedVariant(): MapButtonVariant {
      return this.variant as MapButtonVariant;
    },
    typedSize(): MapButtonSize | string {
      return this.size as MapButtonSize | string;
    },
    sizePx(): number {
      return resolveMapButtonSizePx(this.typedSize);
    },
    isSquare(): boolean {
      return isMapButtonSquareVariant(this.typedVariant);
    },
    variantClass() {
      return mapButtonVariantClass(this.typedVariant);
    },
    sizeClass() {
      return mapButtonSizeClass(this.typedSize);
    },
    bindStyle(): Record<string, string> | undefined {
      if (this.isSquare) {
        return { width: `${this.sizePx}px`, height: `${this.sizePx}px` };
      }
      // Custom numeric size on label variants (no named CSS class)
      if (!this.sizeClass) {
        const pad = Math.round(this.sizePx / 4);
        return {
          minHeight: `${this.sizePx}px`,
          paddingLeft: `${pad}px`,
          paddingRight: `${pad}px`,
        };
      }
      return undefined;
    },
    spinnerSize() {
      return Math.round(this.sizePx * (2 / 3));
    },
    path() {
      return { loading: mdiLoading };
    },
  },
};
</script>
