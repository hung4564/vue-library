<template>
  <SvgIcon size="16" type="mdi" :path="path.show" v-if="isShow" />
  <SvgIcon size="16" type="mdi" :path="path.hide" v-else />
</template>
<script lang="ts" setup>
import { IListView } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { computed } from 'vue';

const props = defineProps<{ item: IListView }>();
const path = {
  show: mdiEye,
  hide: mdiEyeOff,
};
const isShow = computed(() => {
  return props.item.show;
});
</script>
