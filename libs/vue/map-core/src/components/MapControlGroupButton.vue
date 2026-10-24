<template>
  <div
    class="button-container button-group-container"
    :class="[
      {
        'button-group-row-container': row,
        'button-group-column-container': !row,
      },
      attrsClass,
    ]"
    :style="containerStyle"
  >
    <div
      class="button-group-sheet"
      :class="{ 'button-group-sheet-column': !row }"
      style="border-radius: 150px"
    >
      <BaseButton
        v-for="(item, i) in items"
        :key="i"
        variant="icon"
        :size="resolvedSizePx"
        class="map-control-button"
        :title="item.title"
        @click="item.onClick"
      >
        <span class="map-control-button__content">
          <Icon>
            {{ item.icon }}
          </Icon>
        </span>
      </BaseButton>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import {
  isMapButtonSize,
  type MapButtonSize,
  resolveMapButtonSizePx,
} from '@hungpvq/map-core';
import { BaseButton, Icon } from '@hungpvq/vue-ui-core';
import type { PropType } from 'vue';

interface ButtonItem {
  title: string;
  icon: string;
  onClick: (e: MouseEvent) => void;
}
export default {
  name: 'MapControlGroupButton',
  components: { BaseButton, Icon },
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ButtonItem[]>,
      default: () => [],
    },
    row: Boolean,
    /** small | medium | large | number (px) */
    size: {
      type: [Number, String] as PropType<MapButtonSize | string>,
      default: 'medium',
      validator: (v: unknown) => isMapButtonSize(v),
    },
  },
  provide() {
    return {
      isGroup: true,
      size: this.resolvedSizePx,
    };
  },
  computed: {
    resolvedSizePx(): number {
      return resolveMapButtonSizePx(this.size);
    },
    attrsClass(): unknown {
      return this.$attrs.class;
    },
    containerStyle(): Record<string, string | undefined> {
      return {
        width: !this.row ? `${this.resolvedSizePx}px` : undefined,
        height: this.row ? `${this.resolvedSizePx}px` : undefined,
      };
    },
  },
};
</script>
