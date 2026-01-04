<template>
  <div class="group-container">
    <div class="group-header" @click="toggle">
      <div class="icon-column">
        <span class="toggle-icon" :class="{ collapsed }">▶</span>
        <!-- Gạch dọc từ dưới icon chạy xuống -->
        <span class="vertical-line" v-show="!collapsed"></span>
      </div>

      <span class="group-title">{{ title }}</span>
    </div>

    <div v-show="!collapsed" class="group-body">
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

<style scoped>
.group-header {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  gap: 4px;
  padding: 2px 0;
}

.group-header:hover {
  background-color: #f0f0f0;
}

.icon-column {
  position: relative;
  width: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.toggle-icon {
  width: 16px;
  text-align: center;
  color: #666;
  user-select: none;
  line-height: 16px;
  transform: rotate(90deg);
}
.toggle-icon.collapsed {
  transform: rotate(0);
}

.vertical-line {
  display: block;
  width: 1px;
  background: #ccc;
  height: calc(100% - 16px);
  margin-top: 2px;
}

.group-body {
  margin-left: 8px;
  border-left: 1px solid #ccc;
  padding-left: 8px;
}

.group-title {
  font-weight: bold;
  font-family: monospace;
  color: #0a7aca;
}
</style>
