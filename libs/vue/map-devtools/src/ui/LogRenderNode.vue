<script setup lang="ts">
import { formatDevtoolsLogEntryForCopy } from '@hungpvq/map-core/devtools';
import {
  formatLogTime,
  levelLetter,
  namespaceParts,
  objectArgs,
  textMessage,
  type StructuredItem,
} from '@hungpvq/map-debug';
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import GroupItem from './GroupItem.vue';
import TreeItem from './TreeItem.vue';

defineProps<{
  item: StructuredItem;
}>();

const emit = defineEmits<{
  'namespace-click': [namespace: string];
}>();

function formatTime(ts: number) {
  return formatLogTime(ts);
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
      @namespace-click="emit('namespace-click', $event)"
    />
  </GroupItem>

  <div
    v-else
    class="log-entry"
    :class="`log-entry--${item.log.level}`"
  >
    <div class="log-entry__row">
      <span class="log-entry__time">{{ formatTime(item.log.timestamp) }}</span>
      <span
        class="log-entry__level"
        :title="(item.log.level || 'unknown').toUpperCase()"
      >
        {{ levelLetter(item.log.level) }}
      </span>
      <div class="log-entry__content">
        <span v-if="textMessage(item.log)" class="log-entry__msg">{{
          textMessage(item.log)
        }}</span>
        <MapControlButton
          v-if="namespaceParts(item.log.namespaces).path"
          variant="text"
          size="small"
          class="log-entry__ns"
          :title="namespaceParts(item.log.namespaces).full"
          @click="emit('namespace-click', namespaceParts(item.log.namespaces).full)"
        >
          {{ namespaceParts(item.log.namespaces).path }}
        </MapControlButton>
      </div>
      <MapCopyButton
        class="log-entry__copy"
        title="Copy log"
        :value="formatDevtoolsLogEntryForCopy(item.log)"
      />
    </div>
    <div
      v-if="objectArgs(item.log).length"
      class="log-entry__objects"
    >
      <div
        v-for="(arg, index) in objectArgs(item.log)"
        :key="index"
        class="log-entry__object"
      >
        <TreeItem :data="arg" />
      </div>
    </div>
  </div>
</template>
