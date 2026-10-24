<script lang="ts">
export default { name: 'Tabs' };
export type { TabItem } from './tabs';
</script>
<script setup lang="ts">
import { computed, useSlots } from 'vue';

import BaseButton from './BaseButton.vue';
import type { TabItem } from './tabs';

const model = defineModel<string>({ required: true });

const props = withDefaults(
  defineProps<{
    items: TabItem[];
    withPanes?: boolean;
  }>(),
  { withPanes: true },
);

const slots = useSlots();

const activeId = computed(() => {
  if (props.items.some((item) => item.id === model.value)) {
    return model.value;
  }
  return props.items[0]?.id ?? '';
});

const hasPanes = computed(
  () =>
    props.withPanes &&
    props.items.some((item) => typeof slots[item.id] === 'function'),
);

function select(id: string) {
  if (id !== model.value) model.value = id;
}
</script>
<template>
  <div
    class="ui-tabs-root"
    :class="{ 'ui-tabs-root--bar-only': !hasPanes }"
  >
    <div
      class="ui-tabs"
      role="tablist"
    >
      <BaseButton
        v-for="item in items"
        :key="item.id"
        role="tab"
        :aria-selected="activeId === item.id"
        variant="text"
        :active="activeId === item.id"
        @click="select(item.id)"
      >
        {{ item.label }}
      </BaseButton>
    </div>
    <div
      v-if="hasPanes"
      class="ui-tabs__panes"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="ui-tabs__pane"
        role="tabpanel"
        :hidden="activeId !== item.id"
      >
        <slot :name="item.id" />
      </div>
    </div>
  </div>
</template>
