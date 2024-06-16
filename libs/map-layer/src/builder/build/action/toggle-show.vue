<template>
  <SvgIcon size="14" type="mdi" :path="path.show" v-if="isShow" />
  <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
</template>
<script lang="ts" setup>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { IListView } from '../../../types';
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
