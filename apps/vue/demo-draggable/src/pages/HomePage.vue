<script setup lang="ts">
import {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';

const drawerSize = ref(280);

const demos = [
  { to: '/sidebar', label: 'Open Sidebar demo' },
  { to: '/popup', label: 'Open Popup demo' },
  { to: '/float', label: 'Open Float demo' },
  { to: '/bottom', label: 'Open Bottom demo' },
  { to: '/drawer', label: 'Open Drawer demo' },
  { to: '/custom-card', label: 'Open Custom card demo' },
];
</script>

<template>
  <DraggableContainer containerId="demo-home" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Home overview</h2>
        <p>Samples of each type except modal. Use the links to open focused demos.</p>
        <div class="demo-links">
          <RouterLink
            v-for="demo in demos"
            :key="demo.to"
            :to="demo.to"
            class="demo-btn"
          >
            {{ demo.label }}
          </RouterLink>
        </div>
        <h3>Management</h3>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemSideBar show title="Right Sidebar" location="right">
      <div class="panel">
        <h2>Right Sidebar</h2>
        <p>Overview sample — open Sidebar demo for more.</p>
      </div>
    </DraggableItemSideBar>

    <DraggableItemPopup
      show
      title="Popup"
      :top="10"
      :right="10"
      :width="280"
      :height="220"
    >
      <div class="panel">
        <p>Draggable / resizable popup sample.</p>
      </div>
    </DraggableItemPopup>

    <DraggableItemFloat
      show
      title="Float 1"
      :right="10"
      :bottom="10"
      :width="320"
      headerLocation="bottom"
    >
      <div class="panel">
        <p>Float panel with bottom header.</p>
      </div>
    </DraggableItemFloat>

    <DraggableItemFloat
      show
      title="Float 2"
      :top="10"
      :left="10"
      :width="280"
      :maxHeight="360"
    >
      <div class="panel">
        <p>Second float panel.</p>
      </div>
    </DraggableItemFloat>

    <DraggableItemBottom show title="Bottom">
      <div class="panel">
        <p>Bottom panel overview sample.</p>
      </div>
    </DraggableItemBottom>

    <DraggableDrawer
      show
      title="Drawer 1"
      location="right"
      v-model:size="drawerSize"
      :min-size="160"
      :max-size="480"
    >
      <div class="panel">
        Resize me ({{ drawerSize }}px). Switch to Drawer 2 via menu.
      </div>
    </DraggableDrawer>

    <DraggableDrawer
      :show="false"
      title="Drawer 2"
      location="right"
      v-model:size="drawerSize"
      :min-size="160"
      :max-size="480"
    >
      <div class="panel">Second drawer on the same edge.</div>
    </DraggableDrawer>
  </DraggableContainer>
</template>
