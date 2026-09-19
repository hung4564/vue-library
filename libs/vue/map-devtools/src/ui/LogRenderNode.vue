<script setup lang="ts">
import { formatDevtoolsLogEntryForCopy } from '@hungpvq/map-core/devtools';
import {
  formatLogTime,
  shortRequestId,
  textMessage,
  type StructuredItem,
} from '@hungpvq/map-debug';
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import GroupItem from './GroupItem.vue';

const props = defineProps<{
  item: StructuredItem;
  selectedId?: string | null;
}>();

const emit = defineEmits<{
  'namespace-click': [namespace: string];
  'request-id-click': [requestId: string];
  'flow-click': [requestId: string];
  select: [item: StructuredItem];
}>();

const isSelected = computed(
  () => props.item.type === 'log' && props.selectedId === props.item.id,
);

function onRowClick(event: MouseEvent) {
  const t = event.target as HTMLElement | null;
  if (t?.closest('button, a, input, .log-entry__actions')) return;
  emit('select', props.item);
}
</script>

<template>
  <GroupItem
    v-if="item.type === 'group'"
    :title="item.title"
    :collapsed="item.collapsed"
  >
    <LogRenderNode
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :selected-id="selectedId"
      @namespace-click="emit('namespace-click', $event)"
      @request-id-click="emit('request-id-click', $event)"
      @flow-click="emit('flow-click', $event)"
      @select="emit('select', $event)"
    />
  </GroupItem>

  <div
    v-else
    class="log-entry"
    :class="[
      `log-entry--${item.log.header.level}`,
      { 'log-entry--selected': isSelected },
    ]"
    role="button"
    tabindex="0"
    @click="onRowClick"
    @keydown.enter.prevent="emit('select', item)"
  >
    <div class="log-entry__main">
      <span class="log-entry__time">{{
        formatLogTime(item.log.header.ts)
      }}</span>
      <div class="log-entry__row">
        <div class="log-entry__content">
          <span v-if="textMessage(item.log)" class="log-entry__msg">{{
            textMessage(item.log)
          }}</span>
        </div>
        <div class="log-entry__actions">
          <MapControlButton
            v-if="item.log.header.requestId"
            class="log-entry__flow"
            variant="text"
            size="small"
            title="Open request flow"
            @click.stop="emit('flow-click', item.log.header.requestId!)"
          >
            Flow
          </MapControlButton>
          <MapCopyButton
            class="log-entry__copy"
            title="Copy log"
            :value="formatDevtoolsLogEntryForCopy(item.log)"
          />
        </div>
      </div>
      <span
        class="log-entry__level"
        :title="(item.log.header.level || 'unknown').toUpperCase()"
      >
        {{ (item.log.header.level || '?').toUpperCase() }}
      </span>
      <div
        v-if="item.log.header.namespaces[0] || item.log.header.requestId"
        class="log-entry__meta"
      >
        <MapControlButton
          v-if="item.log.header.namespaces[0]"
          variant="text"
          size="small"
          class="log-entry__meta-cell log-entry__ns"
          :title="item.log.header.namespaces[0]"
          @click.stop="
            emit('namespace-click', item.log.header.namespaces[0]!)
          "
        >
          {{ item.log.header.namespaces[0] }}
        </MapControlButton>
        <MapControlButton
          v-if="item.log.header.requestId"
          variant="text"
          size="small"
          class="log-entry__meta-cell log-entry__req"
          :title="item.log.header.requestId"
          @click.stop="emit('request-id-click', item.log.header.requestId!)"
        >
          req={{ shortRequestId(item.log.header.requestId) }}
        </MapControlButton>
      </div>
    </div>
  </div>
</template>
