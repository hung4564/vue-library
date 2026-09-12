<script lang="ts">
export default { name: 'demo-dataset-source-viewer' };
</script>
<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { MapControlButton, ModuleContainer, useMap } from '@hungpvq/vue-map-core';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  title?: string;
  listName?: string;
  definition?: string;
  exampleData?: string;
}>();

const emit = defineEmits<{ close: [] }>();
const { moduleContainerProps } = useMap();
const show = ref(true);
const tab = ref<'definition' | 'example'>('definition');
const copied = ref(false);

const hasExampleData = computed(
  () => Boolean(props.exampleData && props.exampleData.trim()),
);

const code = computed(() =>
  tab.value === 'example' && hasExampleData.value
    ? props.exampleData ?? ''
    : props.definition ?? '',
);

const popupTitle = computed(
  () => props.title || props.listName || 'Dataset source',
);

watch(hasExampleData, (ok) => {
  if (!ok) tab.value = 'definition';
});

function onClose() {
  show.value = false;
  emit('close');
}

async function copyCode() {
  try {
    await navigator.clipboard?.writeText(code.value);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="bind"
        :show="show"
        :width="720"
        :height="520"
        :title="popupTitle"
        @close="onClose"
        @update:show="(v) => !v && onClose()"
      >
        <template #title>{{ popupTitle }}</template>
        <div class="demo-source-viewer">
          <div class="demo-source-viewer__toolbar">
            <div
              v-if="hasExampleData"
              class="demo-source-viewer__tabs"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                class="demo-source-viewer__tab"
                :class="{ 'is-active': tab === 'definition' }"
                :aria-selected="tab === 'definition'"
                @click="tab = 'definition'"
              >
                Definition
              </button>
              <button
                type="button"
                role="tab"
                class="demo-source-viewer__tab"
                :class="{ 'is-active': tab === 'example' }"
                :aria-selected="tab === 'example'"
                @click="tab = 'example'"
              >
                Example data
              </button>
            </div>
            <span v-else class="demo-source-viewer__label">Definition</span>
            <MapControlButton variant="outlined" @click="copyCode">
              {{ copied ? 'Copied' : 'Copy' }}
            </MapControlButton>
          </div>
          <pre class="demo-source-viewer__code" tabindex="0">{{ code }}</pre>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>

<style scoped>
.demo-source-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-size: 12px;
}
.demo-source-viewer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e5e5;
}
.demo-source-viewer__tabs {
  display: flex;
  gap: 4px;
}
.demo-source-viewer__label {
  font-weight: 600;
  color: #444;
}
.demo-source-viewer__tab {
  font: inherit;
  padding: 4px 10px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
}
.demo-source-viewer__tab.is-active {
  border-color: #c5daf0;
  background: #eef5fc;
  font-weight: 600;
}
.demo-source-viewer__code {
  flex: 1;
  margin: 0;
  padding: 10px 12px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre;
  background: #f7f8fa;
}
</style>
