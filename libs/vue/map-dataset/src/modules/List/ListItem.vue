<template>
  <div class="draggale-item" :class="{ 'draggale-item-active': isSelected }">
    <div
      class="draggable-handle"
      v-if="!disabledDrag"
      :style="{
        background:
          item.color ||
          'var(--map-list-item-active-bg, var(--map-primary-color, #1a73e8))',
      }"
    >
      <div class="draggable-handle__icon">
        <SvgIcon size="14" type="mdi" :path="path.draggable" />
      </div>
    </div>
    <div class="draggale-item__info">
      <slot />
    </div>
  </div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiArrowUpDown } from '@mdi/js';
export default {
  components: { SvgIcon },
  props: {
    isSelected: Boolean,
    disabledDrag: Boolean,
    item: { type: Object, default: () => ({}) },
  },
  computed: {
    path() {
      return { draggable: mdiArrowUpDown };
    },
  },
};
</script>
