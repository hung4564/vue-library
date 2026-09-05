<script lang="ts">
export default {
  name: 'ManagementControl',
};
</script>

<script setup lang="ts">
import { assertDefined } from '@hungpvq/draggable';
import { computed, inject, ref, Ref } from 'vue';
import { useManagement, withShareProps } from '../../hook';
import ShowStatusDragItem from './ShowStatusDragItem.vue';
import ShowStatusDrawer from './ShowStatusDrawer.vue';
import ShowStatusSideBar from './ShowStatusSideBar.vue';

const props = defineProps({
  ...withShareProps,
});
const containerId = assertDefined(
  inject<Ref<string>>('containerId', ref(props.containerId || '')),
  '[ManagementControl] Missing containerId',
);
const { width, height, popup, modal, float, bottom, sideBar, drawer } =
  useManagement(containerId.value);

const sidebarCount = computed(() =>
  Object.values(sideBar.value || {}).reduce(
    (sum, side) => sum + (side?.items?.length || 0),
    0,
  ),
);
const drawerCount = computed(() =>
  Object.values(drawer.value || {}).reduce(
    (sum, side) => sum + (side?.items?.length || 0),
    0,
  ),
);
</script>
<template>
  <div class="mgmt">
    <section class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Container</span>
      </header>
      <div class="mgmt__metrics">
        <div class="mgmt__metric">
          <span class="mgmt__metric-label">Width</span>
          <span class="mgmt__metric-value">{{ width }}</span>
        </div>
        <div class="mgmt__metric">
          <span class="mgmt__metric-label">Height</span>
          <span class="mgmt__metric-value">{{ height }}</span>
        </div>
      </div>
    </section>

    <section v-if="sidebarCount > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Sidebars</span>
        <span class="mgmt__count">{{ sidebarCount }}</span>
      </header>
      <ShowStatusSideBar :items="sideBar" :containerId="containerId" />
    </section>

    <section v-if="drawerCount > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Drawers</span>
        <span class="mgmt__count">{{ drawerCount }}</span>
      </header>
      <ShowStatusDrawer :items="drawer" :containerId="containerId" />
    </section>

    <section v-if="popup.items.length > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Popups</span>
        <span class="mgmt__count"
          >{{ popup.show.length }}/{{ popup.items.length }}</span
        >
      </header>
      <ShowStatusDragItem
        :items="popup.items"
        :itemShows="popup.show"
        :containerId="containerId"
      />
    </section>

    <section v-if="modal.items.length > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Modals</span>
        <span class="mgmt__count"
          >{{ modal.show.length }}/{{ modal.items.length }}</span
        >
      </header>
      <ShowStatusDragItem
        :items="modal.items"
        :itemShows="modal.show"
        :containerId="containerId"
      />
    </section>

    <section v-if="float.items.length > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Floats</span>
        <span class="mgmt__count"
          >{{ float.show.length }}/{{ float.items.length }}</span
        >
      </header>
      <ShowStatusDragItem
        :items="float.items"
        :itemShows="float.show"
        :containerId="containerId"
      />
    </section>

    <section v-if="bottom.items.length > 0" class="mgmt__section">
      <header class="mgmt__header">
        <span class="mgmt__title">Bottoms</span>
        <span class="mgmt__count"
          >{{ bottom.show.length }}/{{ bottom.items.length }}</span
        >
      </header>
      <ShowStatusDragItem
        :items="bottom.items"
        :itemShows="bottom.show"
        :containerId="containerId"
      />
    </section>
  </div>
</template>
