<template>
  <div class="group-item">
    <div class="group-item__header" @click="toggle">
      <div class="group-item__icon-column">
        <span
          class="group-item__toggle"
          :class="{ 'group-item__toggle--collapsed': collapsed }"
          >▶</span
        >
        <span class="group-item__line" v-show="!collapsed"></span>
      </div>
      <span class="group-item__title">{{ title }}</span>
    </div>
    <div v-show="!collapsed" class="group-item__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  collapsed?: boolean;
}>();

const collapsed = ref(props.collapsed ?? false);

const toggle = () => {
  collapsed.value = !collapsed.value;
};
</script>
