<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemBottom,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer containerId="demo-bottom" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Bottom demo</h2>
        <p>Bottom sheet style panels.</p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemBottom show title="Bottom panel 1">
      <div class="panel">
        <p>Primary bottom item.</p>
      </div>
    </DraggableItemBottom>

    <DraggableItemBottom :show="false" title="Bottom panel 2">
      <div class="panel">
        <p>Second bottom item — toggle via ManagementControl.</p>
      </div>
    </DraggableItemBottom>
  </DraggableContainer>
</template>
