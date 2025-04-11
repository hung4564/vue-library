<template lang="">
  <button v-bind="$attrs" class="menu-item" :title="item.name">
    <template v-if="item.icon">
      <SvgIcon size="14" type="mdi" :path="item.icon" />
    </template>
  </button>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { computed } from 'vue';
import { IIdentifyView, MenuAction } from '../../../interfaces/dataset.parts';

const props = defineProps<{
  item: MenuAction<IIdentifyView>;
  data: IIdentifyView;
  mapId: string;
}>();
</script>
<style lang=""></style>
