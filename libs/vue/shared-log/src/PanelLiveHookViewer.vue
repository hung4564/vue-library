<template>
  <DevtoolPanelContainer
    class="live-viewer"
    :title="null"
  >
    <template #title>
      <DevtoolPanelToolbar>
        <template #title>
          <Tabs
            v-model="activeTab"
            :items="tabItems"
            :with-panes="false"
          />
        </template>
        <template #actions>
          <BaseButton
            v-if="activeTab === 'traces'"
            title="Clear all recorded live traces"
            @click="onClearTraces"
          >
            Clear traces
          </BaseButton>
          <InputCheckbox
            v-if="activeTab === 'traces'"
            v-model="autoScroll"
            label="Auto-scroll"
          />
        </template>
      </DevtoolPanelToolbar>
    </template>

    <div class="live-viewer__container">
      <div class="live-viewer__body">
        <!-- TAB 1: INSTANCES -->
        <DevtoolPanelSplit v-if="activeTab === 'instances'">
          <!-- Left: Instances Tree -->
          <DevtoolPanelCard class="live-viewer__pane-list">
            <div
              v-if="roots.length === 0"
              class="live-viewer__empty"
            >
              No live instances. Call useLiveHookDebug() in a component.
            </div>
            <LiveNode
              v-for="node in roots"
              :key="node.id"
              :node="node"
              :depth="0"
              :selected-id="selectedInstanceId"
              :instance-renders="instanceRenders"
              :instance-events="instanceEvents"
              @select="onSelectInstance"
            />
          </DevtoolPanelCard>

          <!-- Right: Selected Instance Detail -->
          <DevtoolPanelCard
            as="aside"
            class="live-viewer__pane-detail"
            aria-label="Instance details"
          >
            <template v-if="selectedInstance">
              <div class="log-viewer__detail-h">
                <div>
                  <span
                    class="live-viewer__dot"
                    style="
                      display: inline-block;
                      vertical-align: middle;
                      margin-right: 6px;
                    "
                  />
                  <strong style="word-break: break-all">{{
                    selectedInstance.component
                  }}</strong>
                </div>
                <CopyButton
                  title="Copy instance JSON"
                  :value="JSON.stringify(selectedInstance, null, 2)"
                />
              </div>

              <div class="debug-list-item">
                <span class="debug-list-item-label">Component</span>
                <div class="debug-list-item-value">
                  <span>{{ selectedInstance.component }}</span>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Instance ID</span>
                <div class="debug-list-item-value">
                  <code class="dataset-viewer__mono">{{
                    selectedInstance.id
                  }}</code>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Parent ID</span>
                <div class="debug-list-item-value">
                  <BaseButton
                    v-if="selectedInstance.parentId"
                    variant="text"
                    size="small"
                    :title="`Select parent instance ${selectedInstance.parentId}`"
                    @click="selectedInstanceId = selectedInstance.parentId"
                  >
                    {{ selectedInstance.parentId }}
                  </BaseButton>
                  <span v-else>(none — root component)</span>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Framework</span>
                <div class="debug-list-item-value">
                  <span>{{ selectedInstance.framework }}</span>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Renders</span>
                <div class="debug-list-item-value">
                  <span>#{{ instanceRenders[selectedInstance.id] || 0 }}</span>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Total Events</span>
                <div class="debug-list-item-value">
                  <span>{{ instanceEvents[selectedInstance.id] || 0 }}</span>
                </div>
              </div>

              <!-- Instance Traces History -->
              <section
                class="dataset-viewer__section"
                style="margin-top: 14px"
              >
                <h4 class="dataset-viewer__section-h">
                  Event History ({{ selectedInstanceTraces.length }})
                </h4>
                <p
                  v-if="!selectedInstanceTraces.length"
                  class="live-viewer__empty"
                >
                  No traces recorded for this instance yet.
                </p>
                <List
                  v-else
                  dense
                  divided
                >
                  <ListItem
                    v-for="ev in selectedInstanceTraces"
                    :key="ev.id"
                    interactive
                    dense
                    :title="`Inspect trace ${ev.id}`"
                    @click="viewTrace(ev.id)"
                  >
                    <template #prefix>
                      <span
                        class="live-viewer__event-badge"
                        :class="`live-viewer__event-badge--${shortEventName(ev.data.event)}`"
                      >
                        {{ shortEventName(ev.data.event) }}
                      </span>
                    </template>
                    <div class="live-viewer__event-main">
                      <span
                        v-if="ev.data.renderCount"
                        class="live-viewer__event-render"
                      >
                        #{{ ev.data.renderCount }}
                      </span>
                      <span
                        v-if="ev.data.changes && ev.data.changes.length > 0"
                        class="live-viewer__changes-badge"
                      >
                        {{ ev.data.changes.length }} change(s)
                      </span>
                    </div>
                    <template #suffix>
                      <span class="live-viewer__event-time">
                        {{ formatLogTime(ev.header.ts) }}
                      </span>
                    </template>
                  </ListItem>
                </List>
              </section>
            </template>
            <p
              v-else
              class="live-viewer__empty"
            >
              Select an instance from the tree to inspect details, render count,
              and events.
            </p>
          </DevtoolPanelCard>
        </DevtoolPanelSplit>

        <!-- TAB 2: TRACES -->
        <DevtoolPanelSplit v-else-if="activeTab === 'traces'">
          <!-- Left: Traces Feed -->
          <DevtoolPanelCard
            class="live-viewer__pane-list"
            ref="eventListRef"
          >
            <div
              v-if="liveEvents.length === 0"
              class="live-viewer__empty"
            >
              No traces recorded.
            </div>
            <List
              v-else
              dense
              divided
            >
              <ListItem
                v-for="event in liveEvents"
                :key="event.id"
                :selected="selectedEvent?.id === event.id"
                interactive
                dense
                @click="selectedEventId = event.id"
              >
                <template #prefix>
                  <span
                    class="live-viewer__event-badge"
                    :class="`live-viewer__event-badge--${shortEventName(event.data.event)}`"
                  >
                    {{ shortEventName(event.data.event) }}
                  </span>
                </template>
                <div class="live-viewer__event-main">
                  <span class="live-viewer__event-component">
                    {{ event.data.component }}
                  </span>
                  <span
                    v-if="event.data.renderCount"
                    class="live-viewer__event-render"
                    title="Render Count"
                  >
                    #{{ event.data.renderCount }}
                  </span>
                  <span
                    v-if="event.data.changes && event.data.changes.length > 0"
                    class="live-viewer__changes-badge"
                    title="Changed properties"
                  >
                    {{ event.data.changes.length }} change(s)
                  </span>
                </div>
                <template #suffix>
                  <span class="live-viewer__event-time">
                    {{ formatLogTime(event.header.ts) }}
                  </span>
                </template>
              </ListItem>
            </List>
          </DevtoolPanelCard>

          <!-- Right: Selected Trace Detail -->
          <DevtoolPanelCard
            as="aside"
            class="live-viewer__pane-detail"
            aria-label="Trace details"
          >
            <template v-if="selectedEvent">
              <div class="log-viewer__detail-h">
                <div>
                  <span
                    class="live-viewer__event-badge"
                    :class="`live-viewer__event-badge--${shortEventName(selectedEvent.data.event)}`"
                  >
                    {{ shortEventName(selectedEvent.data.event) }}
                  </span>
                  <strong style="margin-left: 6px">
                    {{ selectedEvent.data.component }}
                  </strong>
                  <span
                    v-if="selectedEvent.data.renderCount"
                    class="live-viewer__event-render"
                    style="margin-left: 6px"
                  >
                    Render #{{ selectedEvent.data.renderCount }}
                  </span>
                </div>
                <CopyButton
                  title="Copy trace JSON"
                  :value="stringifyDebugRecord(selectedEvent)"
                />
              </div>

              <!-- Changed Properties Diff Table -->
              <div
                v-if="
                  selectedEvent.data.changes &&
                  selectedEvent.data.changes.length > 0
                "
                class="dataset-viewer__section"
                style="margin-bottom: 12px"
              >
                <BaseCollapse :selected="true">
                  <template #header>
                    <strong style="font-size: 12px">
                      Changed Properties ({{
                        selectedEvent.data.changes.length
                      }})
                    </strong>
                  </template>
                  <table class="live-viewer__diff-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Previous Value</th>
                        <th>Current Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(change, idx) in selectedEvent.data.changes"
                        :key="change.key ?? idx"
                      >
                        <td style="font-weight: 600">
                          <code>{{ change.key }}</code>
                          <span
                            v-if="change.source"
                            style="
                              font-size: 10px;
                              opacity: 0.7;
                              margin-left: 4px;
                            "
                          >
                            ({{ change.source }})
                          </span>
                        </td>
                        <td class="live-viewer__diff-old">
                          <code>{{
                            formatDiffValue(change.previousValue)
                          }}</code>
                        </td>
                        <td class="live-viewer__diff-new">
                          <code>{{ formatDiffValue(change.nextValue) }}</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </BaseCollapse>
              </div>

              <!-- Metadata table -->
              <div class="debug-list-item">
                <span class="debug-list-item-label">Component</span>
                <div class="debug-list-item-value">
                  <span>{{ selectedEvent.data.component }}</span>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Instance ID</span>
                <div class="debug-list-item-value">
                  <BaseButton
                    variant="text"
                    size="small"
                    :title="`View instance ${selectedEvent.data.instanceId} in Instances tab`"
                    @click="viewInstance(selectedEvent.data.instanceId)"
                  >
                    {{ selectedEvent.data.instanceId }}
                  </BaseButton>
                </div>
              </div>
              <div
                v-if="selectedEvent.data.parentId"
                class="debug-list-item"
              >
                <span class="debug-list-item-label">Parent ID</span>
                <div class="debug-list-item-value">
                  <code class="dataset-viewer__mono">{{
                    selectedEvent.data.parentId
                  }}</code>
                </div>
              </div>
              <div class="debug-list-item">
                <span class="debug-list-item-label">Timestamp</span>
                <div class="debug-list-item-value">
                  <span>{{ formatLogTime(selectedEvent.header.ts) }}</span>
                </div>
              </div>

              <section
                v-if="(selectedEvent.data as any).props !== undefined"
                class="dataset-viewer__section"
              >
                <h4 class="dataset-viewer__section-h">Props</h4>
                <TreeItem :data="(selectedEvent.data as any).props" />
              </section>

              <section
                v-if="(selectedEvent.data as any).state !== undefined"
                class="dataset-viewer__section"
              >
                <h4 class="dataset-viewer__section-h">State</h4>
                <TreeItem :data="(selectedEvent.data as any).state" />
              </section>

              <section
                v-if="selectedEvent.data"
                class="dataset-viewer__section"
              >
                <h4 class="dataset-viewer__section-h">Event Payload</h4>
                <TreeItem :data="selectedEvent.data" />
              </section>

              <div class="log-viewer__detail-meta">
                <h4 class="dataset-viewer__section-h">Header</h4>
                <table class="log-viewer__header-table">
                  <tbody>
                    <tr
                      v-for="row in debugHeaderRows(selectedEvent)"
                      :key="row.key"
                    >
                      <td class="log-viewer__header-label">{{ row.key }}</td>
                      <td class="log-viewer__header-val">
                        <code>{{ row.value }}</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p
              v-else
              class="live-viewer__empty"
            >
              Select a trace event from the timeline to inspect details, changed
              properties, and props/state payload.
            </p>
          </DevtoolPanelCard>
        </DevtoolPanelSplit>
      </div>
    </div>
  </DevtoolPanelContainer>
</template>

<script setup lang="ts">
import {
  clearLiveTraceEvents,
  debugHeaderRows,
  formatLogTime,
  stringifyDebugRecord,
} from '@hungpvq/shared-log';
import {
  BaseButton,
  BaseCollapse,
  CopyButton,
  InputCheckbox,
  List,
  ListItem,
  Tabs,
  TreeItem,
} from '@hungpvq/vue-ui-core';
import { computed, nextTick, ref, watch } from 'vue';
import type { LiveTreeNode } from './live-tree';
import LiveNode from './LiveNode.vue';
import { useVueLogUiStore } from './store';

import DevtoolPanelCard from './ui/DevtoolPanelCard.vue';
import DevtoolPanelContainer from './ui/DevtoolPanelContainer.vue';
import DevtoolPanelSplit from './ui/DevtoolPanelSplit.vue';
import DevtoolPanelToolbar from './ui/DevtoolPanelToolbar.vue';

const { liveInstances, liveEvents, selectedInstanceId, selectedEventId } =
  useVueLogUiStore();

const activeTab = ref<string>('instances');
const autoScroll = ref(true);
const eventListRef = ref<HTMLDivElement | null>(null);

const tabItems = computed(() => [
  { id: 'instances', label: `Instances (${liveInstances.value.length})` },
  { id: 'traces', label: `Traces (${liveEvents.value.length})` },
]);

function shortEventName(eventName: string): string {
  return eventName.replace('component:', '');
}

function onSelectInstance(id: string) {
  selectedInstanceId.value = id || null;
}

function onClearTraces() {
  clearLiveTraceEvents();
  selectedEventId.value = null;
}

function viewTrace(eventId: string) {
  selectedEventId.value = eventId;
  activeTab.value = 'traces';
}

function viewInstance(instanceId: string) {
  selectedInstanceId.value = instanceId;
  activeTab.value = 'instances';
}

function buildTree(): LiveTreeNode[] {
  const map = new Map<string, LiveTreeNode>();
  for (const item of liveInstances.value) {
    map.set(item.id, { ...item, children: [] });
  }
  const nextRoots: LiveTreeNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else nextRoots.push(node);
  }
  return nextRoots;
}

const roots = computed(() => buildTree());

const selectedInstance = computed(() => {
  if (!selectedInstanceId.value) {
    return liveInstances.value[0] ?? null;
  }
  return (
    liveInstances.value.find((item) => item.id === selectedInstanceId.value) ??
    liveInstances.value[0] ??
    null
  );
});

const selectedInstanceTraces = computed(() => {
  if (!selectedInstance.value) return [];
  return liveEvents.value.filter(
    (ev) => ev.data.instanceId === selectedInstance.value?.id,
  );
});

const instanceRenders = computed(() => {
  const map: Record<string, number> = {};
  for (const ev of liveEvents.value) {
    const id = ev.data.instanceId;
    if (id && ev.data.renderCount) {
      map[id] = Math.max(map[id] || 0, ev.data.renderCount);
    }
  }
  return map;
});

const instanceEvents = computed(() => {
  const map: Record<string, number> = {};
  for (const ev of liveEvents.value) {
    const id = ev.data.instanceId;
    if (id) {
      map[id] = (map[id] || 0) + 1;
    }
  }
  return map;
});

const selectedEvent = computed(() => {
  if (!selectedEventId.value) {
    return liveEvents.value[liveEvents.value.length - 1] ?? null;
  }
  return (
    liveEvents.value.find((event) => event.id === selectedEventId.value) ??
    liveEvents.value[liveEvents.value.length - 1] ??
    null
  );
});

function formatDiffValue(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

watch(
  () => liveEvents.value.length,
  () => {
    if (
      autoScroll.value &&
      eventListRef.value &&
      activeTab.value === 'traces'
    ) {
      nextTick(() => {
        if (eventListRef.value) {
          eventListRef.value.scrollTop = eventListRef.value.scrollHeight;
        }
      });
    }
  },
);
</script>
