<script setup lang="ts">
import { computed } from 'vue';
import { functions } from '../../metadata/index';

const props = defineProps<{
  fn: string;
  frontmatter?: any;
  package?: string;
}>();
const info = computed(
  () =>
    Object.assign(
      {},
      functions.find(
        (i) =>
          i.name === props.fn && (!props.package || i.package === props.package)
      ),
      props.frontmatter || {}
    ) || {}
);
</script>

<template>
  <div class="grid grid-cols-[100px_auto] gap-2 text-sm mt-4 mb-8 items-start">
    <template v-if="info.package">
      <div opacity="50">Package</div>
      <div>
        <code>{{ info.package }}</code>
      </div>
    </template>
    <div opacity="50">Category</div>
    <div>
      <a href="">
        {{ info.category }}
      </a>
    </div>
    <template v-if="info.description">
      <div opacity="50">Description</div>
      <div>
        {{ info.description }}
      </div>
    </template>
  </div>
</template>
