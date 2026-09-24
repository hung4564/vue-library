<script setup lang="ts">
import {
  formatSharedLogRecord,
  getDemoAsideNavItems,
  runSharedLogScenario,
  SHARED_LOG_SCENARIOS,
  type SharedLogScenarioId,
} from '@hungpvq/demo-map-datasets';
import {
  type LogAdapter,
  loggerFactory,
  type LogRecord,
} from '@hungpvq/shared-log';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

loggerFactory.enableEverything();

const records = ref<LogRecord[]>([]);
const lastNote = ref('');
const done = ref<Record<string, boolean>>({});
const navItems = getDemoAsideNavItems('vue');

const bufferAdapter: LogAdapter = {
  alwaysOn: true,
  log(record) {
    records.value = [...records.value, record];
  },
};

onMounted(() => {
  loggerFactory.addAdapter(bufferAdapter);
});

onBeforeUnmount(() => {
  const adapters = loggerFactory.getAdapters();
  const i = adapters.indexOf(bufferAdapter);
  if (i >= 0) adapters.splice(i, 1);
});

async function run(id: SharedLogScenarioId) {
  lastNote.value = 'running…';
  const result = await runSharedLogScenario(id);
  done.value = { ...done.value, [id]: result.ok };
  lastNote.value = result.note ?? (result.ok ? 'ok' : 'failed');
}

function clear() {
  records.value = [];
  lastNote.value = '';
}
</script>

<template>
  <div class="shared-log-demo">
    <header class="shared-log-demo__header">
      <div>
        <h1>@hungpvq/shared-log</h1>
        <p>
          No MapLibre — framework-agnostic logging. ConsoleAdapter in DevTools;
          buffer below. Map Flow cookbook:
          <RouterLink to="/logging-cookbook">#/logging-cookbook</RouterLink>
        </p>
      </div>
      <nav class="shared-log-demo__nav" aria-label="Demo pages">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="shared-log-demo__nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>
    <div class="shared-log-demo__layout">
      <aside class="shared-log-demo__panel">
        <h2>Scenarios</h2>
        <ul class="shared-log-demo__list">
          <li v-for="item in SHARED_LOG_SCENARIOS" :key="item.id">
            <button type="button" @click="run(item.id)">
              {{ done[item.id] ? '✓ ' : '' }}{{ item.label }}
            </button>
            <span class="shared-log-demo__expect">{{ item.expect }}</span>
          </li>
        </ul>
        <p v-if="lastNote" class="shared-log-demo__note">{{ lastNote }}</p>
        <button type="button" class="shared-log-demo__clear" @click="clear">
          Clear buffer
        </button>
      </aside>
      <section class="shared-log-demo__logs">
        <h2>Buffered records ({{ records.length }})</h2>
        <pre class="shared-log-demo__pre">{{
          records.length
            ? records.map(formatSharedLogRecord).join('\n')
            : '(empty)'
        }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.shared-log-demo {
  min-height: 100%;
  padding: 16px;
  background: #f4f5f7;
  color: #1a1a1a;
  font-size: 13px;
  overflow: auto;
}
.shared-log-demo__header h1 {
  margin: 0 0 6px;
  font-size: 1.35rem;
}
.shared-log-demo__header p {
  margin: 0 0 12px;
  color: #555;
  max-width: 48rem;
}
.shared-log-demo__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-bottom: 16px;
  max-height: 7.5rem;
  overflow: auto;
}
.shared-log-demo__nav-link {
  font-size: 12px;
  color: #1565c0;
  text-decoration: none;
}
.shared-log-demo__nav-link:hover {
  text-decoration: underline;
}
.shared-log-demo__layout {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: 12px;
  align-items: start;
}
@media (max-width: 720px) {
  .shared-log-demo__layout {
    grid-template-columns: 1fr;
  }
}
.shared-log-demo__panel,
.shared-log-demo__logs {
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 8px;
  padding: 12px 14px;
}
.shared-log-demo__panel h2,
.shared-log-demo__logs h2 {
  margin: 0 0 10px;
  font-size: 14px;
}
.shared-log-demo__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shared-log-demo__list button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  cursor: pointer;
}
.shared-log-demo__expect {
  display: block;
  margin-top: 2px;
  color: #666;
  font-size: 11px;
}
.shared-log-demo__note {
  margin: 10px 0 0;
  padding: 8px;
  background: #f0f4fa;
  border-radius: 6px;
}
.shared-log-demo__clear {
  margin-top: 10px;
  padding: 6px 10px;
  cursor: pointer;
}
.shared-log-demo__pre {
  margin: 0;
  padding: 12px;
  max-height: min(70vh, 640px);
  overflow: auto;
  background: #0f1419;
  color: #d7e0ea;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
