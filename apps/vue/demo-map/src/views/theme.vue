<template>
  <Map>
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <ThemeControl />
    <div class="demo-theme-tokens" data-testid="demo-theme-tokens">
      <div class="demo-theme-tokens__title">Theme tokens</div>
      <dl>
        <dt>--map-primary-color</dt>
        <dd>
          <span
            class="demo-theme-tokens__swatch"
            :style="{ background: primary }"
          />
          {{ primary || '—' }}
        </dd>
        <dt>--map-background-color</dt>
        <dd>
          <span
            class="demo-theme-tokens__swatch"
            :style="{ background: background }"
          />
          {{ background || '—' }}
        </dd>
      </dl>
    </div>
    <DemoHelpPanel />
  </Map>
</template>

<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { ThemeControl, BaseMapControl, Map } from '@hungpvq/vue-map-core';
import { onMounted, onUnmounted, ref } from 'vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import AsideControl from '../layout/aside-control.vue';

const primary = ref('');
const background = ref('');
let raf = 0;
let mo: MutationObserver | undefined;

function readTokens() {
  const style = getComputedStyle(document.documentElement);
  primary.value = style.getPropertyValue('--map-primary-color').trim();
  background.value = style.getPropertyValue('--map-background-color').trim();
}

function scheduleRead() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(readTokens);
}

onMounted(() => {
  readTokens();
  mo = new MutationObserver(scheduleRead);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  mo?.disconnect();
});
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

.demo-theme-tokens {
  position: absolute;
  z-index: 5;
  top: 4.5rem;
  right: 0.75rem;
  min-width: 14rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--map-card-bg, rgba(255, 255, 255, 0.92));
  color: var(--map-card-text, #333);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  font-size: 0.85rem;
  pointer-events: none;
}

.demo-theme-tokens__title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.demo-theme-tokens dl {
  display: grid;
  gap: 0.35rem;
}

.demo-theme-tokens dt {
  opacity: 0.75;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
}

.demo-theme-tokens dd {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.35rem;
  font-family: ui-monospace, monospace;
}

.demo-theme-tokens__swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 0.2rem;
  border: 1px solid var(--map-border-color, #ccc);
  flex-shrink: 0;
}
</style>
