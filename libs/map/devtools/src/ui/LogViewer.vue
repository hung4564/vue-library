<template>
  <div class="log-viewer">
    <div class="log-controls">
      <BaseButton @click="clear">Clear</BaseButton>
      <label>
        <input type="checkbox" v-model="autoScroll" /> Auto-scroll
      </label>
    </div>
    <div class="log-list" ref="logListRef">
      <template v-for="item in structuredLogs" :key="item.id">
        <component :is="RenderItem" :item="item" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
import { computed, h, nextTick, ref, watch } from 'vue';
import { devtoolState } from '../store';
import GroupItem from './GroupItem.vue';
import TreeItem from './TreeItem.vue';

const logs = computed(() => devtoolState.logs);
const logListRef = ref<HTMLElement | null>(null);
const autoScroll = ref(true);

const clear = () => {
  devtoolState.logs = [];
};
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();
const isObject = (val: any) => val !== null && typeof val === 'object';
const formatArg = (arg: any) => String(arg);

// Build tree structure from logs
const structuredLogs = computed(() => {
  const stack: any[] = [];
  const root: any[] = [];

  logs.value.forEach((log) => {
    if (log.level === 'groupCollapsed') {
      const group = {
        id: log.id,
        type: 'group',
        title: log.args.map((a: any) => String(a)).join(' '),
        collapsed: log.level === 'groupCollapsed',
        children: [],
      };

      if (stack.length > 0) stack[stack.length - 1].children.push(group);
      else root.push(group);

      stack.push(group);
    } else if (log.level === 'groupEnd') {
      stack.pop();
    } else {
      const entry = { id: log.id, type: 'log', log };

      if (stack.length > 0) stack[stack.length - 1].children.push(entry);
      else root.push(entry);
    }
  });

  return root;
});

// Renderer for each tree item
const RenderItem = (props: { item: any }) => {
  const item = props.item;

  if (item.type === 'group') {
    return h(
      GroupItem,
      { title: item.title, collapsed: item.collapsed },
      {
        default: () =>
          item.children.map((child: any) => h(RenderItem, { item: child })),
      },
    );
  }

  if (item.type === 'log') {
    const log = item.log;

    return h('div', { class: ['log-entry', log.level] }, [
      // Dòng header: timestamp + level + namespaces
      h('div', { class: 'log-header' }, [
        h('span', { class: 'timestamp' }, formatTime(log.timestamp)),
        h(
          'span',
          { class: 'level' },
          `[${(log.level || 'unknown').toUpperCase()}]`,
        ),
        ...(log.namespaces && log.namespaces.length
          ? [
              h(
                'span',
                { class: 'namespaces' },
                `[${log.namespaces.join(':')}]`,
              ),
            ]
          : []),
      ]),

      // Dòng riêng cho args
      h(
        'div',
        { class: 'log-args' },
        log.args.map((arg: any, i: number) =>
          isObject(arg)
            ? h('div', { class: 'arg-object', key: i }, [
                h(TreeItem, { data: arg }),
              ])
            : h('span', { class: 'arg', key: i }, formatArg(arg)),
        ),
      ),
    ]);
  }

  return null;
};

// Auto scroll to top when new logs inserted
watch(
  () => logs.value.length,
  () => {
    if (!autoScroll.value) return;

    nextTick(() => {
      requestAnimationFrame(() => {
        const list = logListRef.value;
        if (list) list.scrollTop = 0;
      });
    });
  },
);
</script>

<style scoped>
.log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-controls {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 8px;
}

.log-list {
  flex: 1;
  overflow-y: scroll;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
}

.log-header {
  display: flex;
  gap: 4px;
}

::v-deep(.log-args) {
  margin-left: 20px;
  margin-top: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.log-entry {
  border-bottom: 1px solid #eee;
  padding-bottom: 2px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-entry.error {
  color: red;
}
.log-entry.warn {
  color: orange;
}
.log-entry.debug {
  color: gray;
}

.timestamp {
  color: #888;
}
.level {
  font-weight: bold;
}
.namespaces {
  color: #007acc;
}
.arg-object {
  display: inline-block;
  vertical-align: top;
  margin-right: 8px;
}
</style>
