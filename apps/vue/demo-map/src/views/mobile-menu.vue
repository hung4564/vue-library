<template>
  <div class="mobile-menu-demo">
    <div class="mobile-menu-demo__bar">
      <span class="mobile-menu-demo__label">buttonInMobile</span>
      <button
        v-for="mode in modes"
        :key="mode"
        type="button"
        class="mobile-menu-demo__chip"
        :class="{ 'is-active': buttonInMobile === mode }"
        @click="buttonInMobile = mode"
      >
        {{ mode }}
      </button>
      <span class="mobile-menu-demo__hint">
        Resize ≤640px (or DevTools mobile) to see promotion / corner menu
      </span>
    </div>
    <Map :button-in-mobile="buttonInMobile">
      <AsideControl position="top-left" />
      <ToolbarControl />
      <MeasurementControl position="top-right" />
      <GotoControl position="top-right" />
      <InfoControl position="top-right" />
      <ThemeControl />
      <GeoLocateControl />
      <FullScreenControl />
      <ZoomControl />
      <HomeControl />
      <MouseCoordinatesControl />
      <BaseMapControl position="bottom-left" />
    </Map>
  </div>
</template>

<script setup lang="ts">
import type { ButtonInMobile } from '@hungpvq/map-core';
import {
  BaseMapControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  InfoControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  ThemeControl,
  ToolbarControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import AsideControl from '../layout/aside-control.vue';

const modes: ButtonInMobile[] = ['button', 'toolbar', 'menu'];
const buttonInMobile = ref<ButtonInMobile>('menu');
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

body,
html,
#root {
  height: 100%;
}

.mobile-menu-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-menu-demo > .map-container,
.mobile-menu-demo :deep(.map-container) {
  flex: 1;
  min-height: 0;
}

.mobile-menu-demo__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
  z-index: 5;
}

.mobile-menu-demo__label {
  font-size: 13px;
  font-weight: 600;
  margin-right: 4px;
}

.mobile-menu-demo__chip {
  border: 1px solid rgba(0, 0, 0, 0.16);
  background: #fff;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
}

.mobile-menu-demo__chip.is-active {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #0d47a1;
}

.mobile-menu-demo__hint {
  font-size: 12px;
  color: #666;
  margin-left: auto;
}
</style>
