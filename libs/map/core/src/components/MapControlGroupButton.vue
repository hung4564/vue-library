<template>
  <div
    class="button-container button-group-container"
    :class="{
      'button-group-row-container': row,
      'button-group-column-container': !row,
    }"
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
        :height="Number(size)"
        :width="Number(size)"
        text
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
interface ButtonItem {
  title: string;
  icon: string;
  onClick: (e: MouseEvent) => void;
}
export default {
  name: 'MapControlGroupButton',
  components: { MapButton, MapIcon },
  props: {
    // {title:string,icon:string,onClick:(e)=>{}}
    items: {
      type: Array as PropType<ButtonItem[]>,
      default: () => [],
    },
    row: Boolean,
    size: { type: [Number, String], default: 32 },
  },
  provide() {
    return {
      isGroup: true,
      size: this.size,
    };
  },
  computed: {
    containerStyle(): Record<string, string | undefined> {
      return {
        width: !this.row ? `${this.size}px` : undefined,
        height: this.row ? `${this.size}px` : undefined,
      };
    },
  },
};
</script>

<style scoped>
.button-group-container ::deep(.map-control-button) {
  background-color: unset !important;
}
.button-group-row-container ::deep(.map-control-button:not(:last-child)) {
  border-right: thin solid rgba(0, 0, 0, 0.12);
}
.button-group-column-container ::deep(.map-control-button:not(:first-child)) {
  border-top: thin solid rgba(0, 0, 0, 0.12);
}
.button-group-sheet {
  background-color: #ffffff;
  border-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
}
.button-group-sheet-column {
  flex-direction: column;
}
</style>
