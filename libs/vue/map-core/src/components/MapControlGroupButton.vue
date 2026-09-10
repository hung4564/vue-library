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
      <MapButton
        v-for="(item, i) in items"
        :key="i"
        :size="resolvedSizePx"
        :title="item.title"
        @click="item.onClick"
      >
        <MapIcon>
          {{ item.icon }}
        </MapIcon>
      </MapButton>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import MapButton from './MapButton.vue';
import MapIcon from './MapIcon.vue';
import {
  isMapButtonSize,
  resolveMapButtonSizePx,
  type MapButtonSize,
} from './map-button-variant';

interface ButtonItem {
  title: string;
  icon: string;
  onClick: (e: MouseEvent) => void;
}
export default {
  name: 'MapControlGroupButton',
  components: { MapButton, MapIcon },
  inheritAttrs: false,
  props: {
    // {title:string,icon:string,onClick:(e)=>{}}
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
