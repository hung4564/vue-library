<script lang="ts">
export default {
  name: 'WorkerControl',
};
</script>
<script setup lang="ts">
import {
  filterWorkerSnapshots,
  formatWorkerDuration,
  formatWorkerLogTime,
  isWorkerBusy,
  resolveSelectedWorkerId,
  workerProgressRatio,
  WORKER_CONTROL_LOCALE,
  type WorkerRuntimeStatus,
  type WorkerSnapshot,
  type WorkerTaskSnapshot,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCogs, mdiEraser, mdiNotificationClearAll } from '@mdi/js';
import { computed, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { useWorkerMonitor } from '../../extra/worker';
import { BaseButton } from '../../field';
import { defaultMapProps, useMap, useShow, WithShowProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});

const { mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(WORKER_CONTROL_LOCALE);

const { workers, now, busy, clearHistory } = useWorkerMonitor();
const [show, toggleShow] = useShow(props.show);
const query = ref('');
const selectedId = ref('');

const filtered = computed(() =>
  filterWorkerSnapshots(workers.value, query.value),
);
const selected = computed(() => {
  const id = resolveSelectedWorkerId(filtered.value, selectedId.value);
  return filtered.value.find((worker) => worker.id === id) ?? null;
});
const busyCount = computed(
  () => workers.value.filter(isWorkerBusy).length,
);
const manyWorkers = computed(() => workers.value.length > 1);
const hasSelectedHistory = computed(
  () =>
    Boolean(selected.value) &&
    (selected.value!.history.length > 0 || selected.value!.logs.length > 0),
);
const hasAnyHistory = computed(() =>
  workers.value.some(
    (worker) => worker.history.length > 0 || worker.logs.length > 0,
  ),
);

const { panelPosition } = useRegisterMapControl(mapId, {
  id: 'mapWorkerControl',
  panelKind: 'sidebar',
  title: () => trans.value('map.worker-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow: toggleShow,
  initialPanelPosition: { location: 'left' },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapWorkerControl',
      run: () => toggleShow(),
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapWorkerControl',
  getState() {
    return {
      title: trans.value('map.worker-control.title'),
      order: order.value,
      active: show.value || busy.value,
      icon: {
        type: 'mdi' as const,
        path: mdiCogs,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});

watch([show, busy], () => {
  control.sync();
});

function statusLabel(status: WorkerRuntimeStatus) {
  return trans.value(`map.worker-control.status.${status}`);
}

function engineLabel(engine: WorkerTaskSnapshot['engine']) {
  return trans.value(`map.worker-control.engine.${engine}`);
}

function elapsed(task: WorkerTaskSnapshot) {
  const ms = task.durationMs ?? Math.max(0, now.value - task.startedAt);
  return formatWorkerDuration(ms);
}

function progressPercent(task: WorkerTaskSnapshot) {
  const ratio = workerProgressRatio(task.progress);
  if (ratio == null) return null;
  return Math.round(ratio * 100);
}

function progressText(task: WorkerTaskSnapshot) {
  const percent = progressPercent(task);
  const message = task.progress?.message;
  if (percent == null) return message || '';
  return message ? `${percent}% · ${message}` : `${percent}%`;
}

function historyItems(worker: WorkerSnapshot) {
  return worker.history.slice(0, 8);
}

function logItems(worker: WorkerSnapshot) {
  return worker.logs.slice(0, 40);
}

function pendingLabel(worker: WorkerSnapshot) {
  if (!worker.pending.length) return '';
  return trans.value('map.worker-control.pending', {
    n: String(worker.pending.length),
  });
}

function summaryText() {
  const count = trans.value('map.worker-control.count', {
    n: String(workers.value.length),
  });
  if (!busyCount.value) return count;
  return `${count} · ${trans.value('map.worker-control.busyCount', {
    n: String(busyCount.value),
  })}`;
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      />
    </template>
    <template #draggable="slotProps">
      <DraggableItemSideBar
        :containerId="slotProps.containerId"
        v-model:show="show"
        :title="trans('map.worker-control.title')"
        :location="panelPosition.location || 'left'"
      >
        <template #title>
          {{ trans('map.worker-control.title') }}
        </template>
        <div class="map-worker-control">
          <div class="map-worker-control__toolbar">
            <span v-if="workers.length" class="map-worker-control__summary">
              {{ summaryText() }}
            </span>
            <div class="map-worker-control__toolbar-actions">
              <BaseButton
                :title="trans('map.worker-control.action.clear')"
                :disabled="!hasSelectedHistory"
                @click.stop="selected && clearHistory(selected.id)"
              >
                <SvgIcon :size="16" type="mdi" :path="mdiEraser" />
              </BaseButton>
              <BaseButton
                v-if="manyWorkers"
                :title="trans('map.worker-control.action.clearAll')"
                :disabled="!hasAnyHistory"
                @click.stop="clearHistory()"
              >
                <SvgIcon :size="16" type="mdi" :path="mdiNotificationClearAll" />
              </BaseButton>
            </div>
          </div>
          <p v-if="!workers.length" class="map-worker-control__empty">
            {{ trans('map.worker-control.empty') }}
          </p>
          <p v-if="!workers.length" class="map-worker-control__hint">
            {{ trans('map.worker-control.hint') }}
          </p>
          <template v-if="manyWorkers">
            <input
              v-model="query"
              type="search"
              class="map-worker-control__search"
              :aria-label="trans('map.worker-control.search')"
              :placeholder="trans('map.worker-control.searchPlaceholder')"
            />
            <p v-if="!filtered.length" class="map-worker-control__empty">
              {{ trans('map.worker-control.emptyMatch') }}
            </p>
            <ul v-else class="map-worker-control__list">
              <li
                v-for="worker in filtered"
                :key="worker.id"
                class="map-worker-control__item"
                :class="{ 'is-selected': selected?.id === worker.id }"
              >
                <button
                  type="button"
                  class="map-worker-control__pick"
                  @click="selectedId = worker.id"
                >
                  <span class="map-worker-control__pick-name">{{
                    worker.name
                  }}</span>
                  <span
                    class="map-worker-control__status"
                    :data-status="worker.status"
                  >
                    {{ statusLabel(worker.status) }}
                  </span>
                  <span v-if="worker.name !== worker.id || pendingLabel(worker)" class="map-worker-control__pick-meta">
                    {{
                      [worker.name !== worker.id ? worker.id : '', pendingLabel(worker)]
                        .filter(Boolean)
                        .join(' · ')
                    }}
                  </span>
                </button>
              </li>
            </ul>
          </template>
          <div v-if="selected" class="map-worker-control__detail">
            <article class="map-worker-control__worker">
              <header class="map-worker-control__head">
                <div class="map-worker-control__name">{{ selected.name }}</div>
                <span
                  class="map-worker-control__status"
                  :data-status="selected.status"
                >
                  {{ statusLabel(selected.status) }}
                </span>
              </header>
              <div class="map-worker-control__stats">
                <span>{{ trans('map.worker-control.stats.ok') }} {{ selected.stats.ok }}</span>
                <span>{{ trans('map.worker-control.stats.error') }} {{ selected.stats.error }}</span>
                <span>{{ trans('map.worker-control.stats.fallback') }} {{ selected.stats.fallback }}</span>
              </div>
              <div v-if="selected.pending.length" class="map-worker-control__tasks">
                <div
                  v-for="task in selected.pending"
                  :key="task.id"
                  class="map-worker-control__task"
                >
                  <div class="map-worker-control__task-row">
                    <span>{{ task.type }}</span>
                    <span>{{ engineLabel(task.engine) }} · {{ elapsed(task) }}</span>
                  </div>
                  <div
                    class="map-worker-control__bar"
                    :class="{ 'is-indeterminate': progressPercent(task) == null }"
                    role="progressbar"
                    :aria-valuenow="progressPercent(task) ?? undefined"
                  >
                    <div
                      class="map-worker-control__bar-fill"
                      :style="
                        progressPercent(task) != null
                          ? { width: `${progressPercent(task)}%` }
                          : undefined
                      "
                    />
                  </div>
                  <div v-if="progressText(task)" class="map-worker-control__progress">
                    {{ progressText(task) }}
                  </div>
                </div>
              </div>
              <p v-if="selected.lastError" class="map-worker-control__error">
                {{ trans('map.worker-control.field.error') }}: {{ selected.lastError }}
              </p>
              <div v-if="logItems(selected).length" class="map-worker-control__logs">
                <div class="map-worker-control__history-title">
                  {{ trans('map.worker-control.field.logs') }}
                </div>
                <div class="map-worker-control__log-list">
                  <div
                    v-for="entry in logItems(selected)"
                    :key="entry.id"
                    class="map-worker-control__log"
                    :data-level="entry.level"
                  >
                    <span class="map-worker-control__log-time">{{
                      formatWorkerLogTime(entry.at)
                    }}</span>
                    <span class="map-worker-control__log-level">{{
                      entry.level
                    }}</span>
                    <span class="map-worker-control__log-message">{{
                      entry.message
                    }}</span>
                  </div>
                </div>
              </div>
              <div v-if="historyItems(selected).length" class="map-worker-control__history">
                <div class="map-worker-control__history-title">
                  {{ trans('map.worker-control.field.history') }}
                </div>
                <div
                  v-for="task in historyItems(selected)"
                  :key="task.id"
                  class="map-worker-control__history-row"
                  :data-status="task.status"
                >
                  <span>{{ task.status === 'ok' ? '✓' : '✕' }} {{ task.type }}</span>
                  <span>
                    {{ engineLabel(task.engine) }} · {{ elapsed(task) }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <slot />
  </ModuleContainer>
</template>
