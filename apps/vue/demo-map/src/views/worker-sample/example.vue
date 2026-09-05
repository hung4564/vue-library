<template>
  <div class="map-page worker-sample-page">
    <Map>
      <AsideControl position="top-left" />
      <WorkerControl position="top-left" />
      <BaseMapControl position="bottom-left" />
      <ZoomControl />
      <HomeControl />
    </Map>

    <div class="sample-worker-panel">
      <h3>Sample worker</h3>
      <p>
        Open <strong>Workers</strong> (left), then run a sum task. Watch
        progress, task logs, and the shared worker log.
      </p>
      <label>
        From
        <input v-model.number="from" type="number" />
      </label>
      <label>
        To
        <input v-model.number="to" type="number" />
      </label>
      <button type="button" :disabled="running" @click="onRun">
        {{ running ? 'Running…' : 'Run sum-range' }}
      </button>
      <p v-if="result != null" class="sample-worker-panel__result">
        Result: {{ result }}
      </p>
      <p v-if="error" class="sample-worker-panel__error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BaseMapControl,
  HomeControl,
  Map,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { onBeforeUnmount, ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import {
  runSampleSumRange,
  terminateSampleWorker,
} from '../../workers/sample-worker.client';

const from = ref(1);
const to = ref(200_000);
const running = ref(false);
const result = ref<number | null>(null);
const error = ref('');

async function onRun() {
  running.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await runSampleSumRange(from.value, to.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    running.value = false;
  }
}

onBeforeUnmount(() => {
  terminateSampleWorker();
});
</script>

<style>
.worker-sample-page {
  position: relative;
  height: 100%;
}

.sample-worker-panel {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 12px;
  width: min(320px, calc(100% - 24px));
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sample-worker-panel h3 {
  margin: 0;
  font-size: 14px;
}

.sample-worker-panel p {
  margin: 0;
  color: #444;
}

.sample-worker-panel label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #555;
}

.sample-worker-panel input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.sample-worker-panel button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.sample-worker-panel button:disabled {
  opacity: 0.6;
  cursor: default;
}

.sample-worker-panel__result {
  font-family: ui-monospace, Menlo, Consolas, monospace;
}

.sample-worker-panel__error {
  color: #c62828;
}

* {
  padding: 0;
  margin: 0;
}

body,
html,
#root {
  height: 100%;
}

.map-page {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
