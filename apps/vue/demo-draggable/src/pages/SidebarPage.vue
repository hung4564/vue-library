<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer containerId="demo-sidebar" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Sidebar demo</h2>
        <p>Multiple sidebars per edge; switch via the menu button.</p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemSideBar show title="Right A" location="right">
      <div class="panel">
        <h2>Right A</h2>
        <p>First right sidebar.</p>
      </div>
    </DraggableItemSideBar>

    <DraggableItemSideBar :show="false" title="Right B" location="right">
      <div class="panel">
        <h2>Right B</h2>
        <p>Second right sidebar — open via menu.</p>
      </div>
    </DraggableItemSideBar>

    <DraggableItemSideBar :show="false" title="Bottom panel" location="bottom">
      <div class="panel">
        <h2>Bottom sidebar</h2>
        <p>Horizontal edge example.</p>
      </div>
    </DraggableItemSideBar>
  </DraggableContainer>
</template>
