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

<style scoped>
.item-list {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
}

.item {
  display: flex;
  transition: color 0.2s ease;
  min-height: 32px;
  align-items: center;
}
.item > .item-label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item > .item-action {
  flex: 0 0 auto;
}
.item.active {
  color: var(--v-primary-base, #1a73e8);
}
</style>
