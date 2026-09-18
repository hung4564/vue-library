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
        <p>
          Only one bottom sheet is visible. Open the header menu to switch
          panels (or use ManagementControl).
        </p>
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
        <p>Second bottom — switch via the bottom header menu.</p>
      </div>
    </DraggableItemBottom>

    <DraggableItemBottom :show="false" title="Bottom panel 3">
      <div class="panel">
        <p>Third bottom — exclusive with the others.</p>
      </div>
    </DraggableItemBottom>
  </DraggableContainer>
</template>
