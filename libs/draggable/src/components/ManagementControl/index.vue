<script lang="ts">
export default {
  name: 'ManagementControl',
};
</script>

<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import { useManagement, withShareProps } from '../../hook';
import { assertDefined } from '../../utils/assert';
import ShowStatusDragItem from './ShowStatusDragItem.vue';
import ShowStatusSideBar from './ShowStatusSideBar.vue';

const props = defineProps({
  ...withShareProps,
});
const containerId = assertDefined(
  inject<Ref<string>>('containerId', ref(props.containerId || '')),
  '[ManagementControl] Missing containerId',
);
const { width, height, items, itemShows, sideBar } = useManagement(
  containerId.value,
);
</script>
<template>
  <div class="management-info-container">
    <div class="management-info-line">
      <label>Width</label>
      <span>{{ width }}</span>
    </div>
    <div class="management-info-line">
      <label>Height</label>
      <span>{{ height }}</span>
    </div>
    <div>
      <ShowStatusSideBar :items="sideBar" :containerId="containerId" />
    </div>
    <div>
      <div class="management-info-line">
        <label>Item</label>
      </div>
      <ShowStatusDragItem
        :items="items"
        :itemShows="itemShows"
        :containerId="containerId"
      />
    </div>
  </div>
</template>
<style scoped>
.management-info-line {
  display: flex;
  gap: 8px;
}
.management-info-line label {
  font-weight: bold;
}
.management-info-container {
  display: flex;
  padding: 4px;
  gap: 4px;
  flex-direction: column;
}
</style>
