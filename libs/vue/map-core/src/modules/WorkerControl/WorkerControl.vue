<script lang="ts">
export default {
  name: 'WorkerControl',
};
</script>
<script setup lang="ts">
import {
  filterWorkerSnapshots,
  formatWorkerDuration,
  isWorkerBusy,
  resolveSelectedWorkerId,
  WORKER_CONTROL_LOCALE,
  workerLogsForDisplay,
  workerProgressRatio,
  type WithMapPropType,
  type WorkerRuntimeStatus,
  type WorkerSnapshot,
  type WorkerTaskSnapshot,
} from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCogs, mdiEraser, mdiNotificationClearAll } from '@mdi/js';
import { computed, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { useWorkerMonitor } from '../../extra/worker';
import { BaseButton, Collapse } from '../../field';
import { defaultMapProps, useMap, useShow, WithShowProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
import WorkerLogList from './WorkerLogList.vue';

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

// Persist selection so progress/log updates do not re-pick "busy" every time.
watch(
  filtered,
  (list) => {
    if (!list.length) {
      selectedId.value = '';
      return;
    }
    const stillValid = list.some((worker) => worker.id === selectedId.value);
    if (!stillValid) {
      selectedId.value = resolveSelectedWorkerId(list, '');
    }
  },
  { immediate: true },
);

const selected = computed(
  () => filtered.value.find((worker) => worker.id === selectedId.value) ?? null,
);
const selectedLogs = computed(() =>
  selected.value ? workerLogsForDisplay(selected.value.logs) : [],
);
const busyCount = computed(() => workers.value.filter(isWorkerBusy).length);
const manyWorkers = computed(() => workers.value.length > 1);
const hasSelectedHistory = computed(() => {
  const worker = selected.value;
  if (!worker) return false;
  if (worker.history.length > 0 || worker.logs.length > 0) return true;
  return worker.pending.some((task) => (task.logs?.length ?? 0) > 0);
});
const hasAnyHistory = computed(() =>
  workers.value.some(
    (worker) =>
      worker.history.length > 0 ||
      worker.logs.length > 0 ||
      worker.pending.some((task) => (task.logs?.length ?? 0) > 0),
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
        :location="panelPosition.location || 'right'"
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
                <SvgIcon
                  :size="16"
                  type="mdi"
                  :path="mdiNotificationClearAll"
                />
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
                  <span
                    v-if="worker.name !== worker.id || pendingLabel(worker)"
                    class="map-worker-control__pick-meta"
                  >
                    {{
                      [
                        worker.name !== worker.id ? worker.id : '',
                        pendingLabel(worker),
                      ]
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
                <span
                  >{{ trans('map.worker-control.stats.ok') }}
                  {{ selected.stats.ok }}</span
                >
                <span
                  >{{ trans('map.worker-control.stats.error') }}
                  {{ selected.stats.error }}</span
                >
                <span
                  >{{ trans('map.worker-control.stats.fallback') }}
                  {{ selected.stats.fallback }}</span
                >
              </div>
              <div class="map-worker-control__tasks">
                <template v-if="selected.pending.length">
                  <div
                    v-for="task in selected.pending"
                    :key="task.id"
                    class="map-worker-control__task"
                  >
                    <div class="map-worker-control__task-row">
                      <span>{{ task.type }}</span>
                      <span
                        >{{ engineLabel(task.engine) }} ·
                        {{ elapsed(task) }}</span
                      >
                    </div>
                    <div
                      class="map-worker-control__bar"
                      :class="{
                        'is-indeterminate': progressPercent(task) == null,
                      }"
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
                    <div class="map-worker-control__progress">
                      {{ progressText(task) || '\u00a0' }}
                    </div>
                    <Collapse class="map-worker-control__task-logs">
                      <template #header>
                        {{ trans('map.worker-control.field.taskLogs') }}
                      </template>
                      <WorkerLogList
                        :logs="workerLogsForDisplay(task.logs ?? [])"
                        compact
                      />
                    </Collapse>
                  </div>
                </template>
                <div v-else class="map-worker-control__task is-idle">
                  <div class="map-worker-control__task-row">
                    <span>{{
                      trans('map.worker-control.noRunning')
                    }}</span>
                    <span>—</span>
                  </div>
                  <div class="map-worker-control__bar is-idle" aria-hidden="true">
                    <div class="map-worker-control__bar-fill" />
                  </div>
                  <div class="map-worker-control__progress" aria-hidden="true">
                    &nbsp;
                  </div>
                  <Collapse
                    class="map-worker-control__task-logs"
                  >
                    <template #header>
                      {{ trans('map.worker-control.field.taskLogs') }}
                    </template>
                    <WorkerLogList :logs="[]" compact />
                  </Collapse>
                </div>
              </div>
              <p v-if="selected.lastError" class="map-worker-control__error">
                {{ trans('map.worker-control.field.error') }}:
                {{ selected.lastError }}
              </p>
              <Collapse
                v-if="selectedLogs.length"
                class="map-worker-control__logs"
              >
                <template #header>
                  {{ trans('map.worker-control.field.logs') }}
                </template>
                <WorkerLogList :logs="selectedLogs" />
              </Collapse>
              <div
                v-if="selected.history.length"
                class="map-worker-control__history"
              >
                <div class="map-worker-control__history-title">
                  {{ trans('map.worker-control.field.history') }}
                </div>
                <Collapse
                  v-for="task in selected.history"
                  :key="task.id"
                  class="map-worker-control__history-item"
                  :data-status="task.status"
                  :selected="false"
                >
                  <template #header>
                    <div
                      class="map-worker-control__history-row"
                      :data-status="task.status"
                    >
                      <span
                        >{{ task.status === 'ok' ? '✓' : '✕' }}
                        {{ task.type }}</span
                      >
                      <span>
                        {{ engineLabel(task.engine) }} · {{ elapsed(task) }}
                      </span>
                    </div>
                  </template>
                  <WorkerLogList
                    v-if="task.logs?.length"
                    :logs="workerLogsForDisplay(task.logs)"
                    compact
                  />
                </Collapse>
              </div>
            </article>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <slot />
  </ModuleContainer>
</template>
