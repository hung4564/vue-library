<template>
  <div class="devtools-container">
    <div v-if="state.isOpen" class="devtools-panel">
      <div class="devtools-header">
        <div class="tabs">
          <BaseButton
            :active="state.activeTab === 'store'"
            @click="state.activeTab = 'store'"
          >
            Store
          </BaseButton>
          <BaseButton
            :active="state.activeTab === 'logs'"
            @click="state.activeTab = 'logs'"
          >
            Logs
          </BaseButton>
        </div>
        <BaseButton class="close-btn" @click="toggle">X</BaseButton>
      </div>
      <div class="devtools-content">
        <StoreViewer v-if="state.activeTab === 'store'" />
        <LogViewer v-if="state.activeTab === 'logs'" />
      </div>
    </div>
    <button v-else class="devtools-toggle" @click="toggle">🛠️</button>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
import { devtoolState } from '../store';
import LogViewer from './LogViewer.vue';
import StoreViewer from './StoreViewer.vue';

const state = devtoolState;

const toggle = () => {
  state.isOpen = !state.isOpen;
};
</script>

<style scoped>
.devtools-container {
  position: fixed;
  bottom: 45px;
  right: 50px;
  z-index: 9999;
  font-family: sans-serif;
}

.devtools-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #333;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.devtools-panel {
  position: fixed;
  bottom: 45px;
  right: 50px;
  width: 600px;
  height: 400px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.devtools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.tabs {
  display: flex;
  gap: 8px;
}

.devtools-content {
  flex: 1;
  overflow: hidden;
}
</style>
