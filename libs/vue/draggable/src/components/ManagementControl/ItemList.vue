<template>
  <ul v-if="items.length > 0" class="mgmt-list">
    <li
      v-for="item in items"
      :key="item"
      :class="[
        'mgmt-row',
        { 'mgmt-row--active': show === item || itemShows?.includes(item) },
      ]"
      @click="$emit('click:item', item)"
    >
      <div class="mgmt-row__label">
        <Item :item="item" :containerId="containerId" />
      </div>
      <div class="mgmt-row__status">
        <span
          class="mgmt-dot"
          :class="{
            'mgmt-dot--on': show === item || itemShows?.includes(item),
          }"
        />
      </div>
      <div class="mgmt-row__actions">
        <slot
          name="extra"
          :item="item"
          :show="show === item || itemShows?.includes(item)"
        ></slot>
      </div>
    </li>
  </ul>
  <p v-else class="mgmt__empty">Empty</p>
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
