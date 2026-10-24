<script setup lang="ts">
import {
  formatDebugLogEntryForCopy,
  formatLogTime,
  logActionId,
  type LogRecord,
  shortActionId,
  textMessage,
} from '@hungpvq/shared-log';
import { computed } from 'vue';

import { BaseButton, CopyButton } from '@hungpvq/vue-ui-core';

const props = defineProps<{
  log: LogRecord;
  selectedId?: string | null;
}>();

const emit = defineEmits<{
  'namespace-click': [namespace: string];
  'action-id-click': [actionId: string];
  'flow-click': [actionId: string];
  select: [log: LogRecord];
}>();

const isSelected = computed(() => props.selectedId === props.log.id);
const actionId = computed(() => logActionId(props.log));
const message = computed(() => textMessage(props.log));

function onRowClick(event: MouseEvent) {
  const t = event.target as HTMLElement | null;
  if (t?.closest('button, a, input, .log-entry__actions')) return;
  emit('select', props.log);
}
</script>

<template>
  <div
    class="log-entry"
    :class="[
      `log-entry--${log.header.level}`,
      { 'log-entry--selected': isSelected },
    ]"
    role="button"
    tabindex="0"
    @click="onRowClick"
    @keydown.enter.prevent="emit('select', log)"
  >
    <div class="log-entry__main">
      <span class="log-entry__time">{{ formatLogTime(log.header.ts) }}</span>
      <div class="log-entry__row">
        <div class="log-entry__content">
          <span
            v-if="message"
            class="log-entry__msg"
            >{{ message }}</span
          >
        </div>
        <div class="log-entry__actions">
          <BaseButton
            v-if="actionId"
            class="log-entry__flow"
            title="Open action flow"
            @click.stop="emit('flow-click', actionId!)"
          >
            Flow
          </BaseButton>
          <CopyButton
            class="log-entry__copy"
            title="Copy log"
            :value="formatDebugLogEntryForCopy(log)"
          />
        </div>
      </div>
      <span
        class="log-entry__level"
        :title="(log.header.level || 'unknown').toUpperCase()"
      >
        {{ (log.header.level || '?').toUpperCase() }}
      </span>
      <div
        v-if="log.header.namespaces[0] || actionId"
        class="log-entry__meta"
      >
        <BaseButton
          v-if="log.header.namespaces[0]"
          class="log-entry__meta-cell log-entry__ns"
          :title="log.header.namespaces[0]"
          @click.stop="emit('namespace-click', log.header.namespaces[0]!)"
        >
          {{ log.header.namespaces[0] }}
        </BaseButton>
        <BaseButton
          v-if="actionId"
          class="log-entry__meta-cell log-entry__req"
          :title="actionId"
          @click.stop="emit('action-id-click', actionId!)"
        >
          action={{ shortActionId(actionId) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
