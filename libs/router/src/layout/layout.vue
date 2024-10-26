<script lang="ts">
export default {
  name: 'layout',
};
</script>
<script setup lang="ts">
import { markRaw, shallowRef, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { getLayout } from '../store';
const DefaultLayout = markRaw(getLayout('default')!);
const route = useRoute();
const layout = shallowRef(DefaultLayout);

watch(
  () => route.meta,
  async (meta) => {
    try {
      layout.value = meta.layout ? getLayout(meta.layout) : DefaultLayout;
    } catch (e) {
      layout.value = DefaultLayout;
    }
  },
  { immediate: true }
);
</script>
<template lang="">
  <component :is="layout"> <router-view /> </component>
</template>
<style lang=""></style>
