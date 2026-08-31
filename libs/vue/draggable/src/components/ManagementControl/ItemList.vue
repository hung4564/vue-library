<template>
  <ul v-if="items.length > 0" class="item-list">
    <li
      v-for="item in items"
      :key="item"
      :class="['item', { active: show === item || itemShows?.includes(item) }]"
      @click="$emit('click:item', item)"
    >
      <div class="item-label">
        <Item :item="item" :containerId="containerId" />
      </div>
      <div class="item-action">
        <slot
          name="extra"
          :item="item"
          :show="show === item || itemShows?.includes(item)"
        ></slot>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import Item from './Item.vue';

defineProps<{
  items: string[];
  show?: string;
  containerId: string;
  itemShows?: string[];
}>();

defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_e: 'click:item', _id: string): void;
}>();
</script>
