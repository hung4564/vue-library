<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemDrawer,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';

const drawerSize = ref(300);
</script>

<template>
  <DraggableContainer
    containerId="demo-drawer"
    class="demo-page"
  >
    <DraggableItemSideBar
      show
      title="Controls"
      location="left"
    >
      <div class="panel">
        <h2>Drawer demo</h2>
        <p>
          Two drawers on the same edge share size and switch via the drawer
          menu.
        </p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemDrawer
      show
      title="Drawer Right 1"
      location="right"
      v-model:size="drawerSize"
      :min-size="160"
      :max-size="520"
    >
      <div class="panel">
        Right drawer 1 — {{ drawerSize }}px. Use menu to open Drawer 2.
      </div>
    </DraggableItemDrawer>

    <DraggableItemDrawer
      :show="false"
      title="Drawer Right 2"
      location="right"
      v-model:size="drawerSize"
      :min-size="160"
      :max-size="520"
    >
      <div class="panel">Right drawer 2 on the same edge.</div>
    </DraggableItemDrawer>

    <DraggableItemDrawer
      :show="false"
      title="Drawer Left"
      location="left"
      :size="260"
      :min-size="160"
      :max-size="400"
    >
      <div class="panel">Left edge drawer — open via ManagementControl.</div>
    </DraggableItemDrawer>
  </DraggableContainer>
</template>
