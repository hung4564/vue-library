<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemFloat,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer containerId="demo-float" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Float demo</h2>
        <p>Floating panels with optional bottom header and order controls.</p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemFloat
      show
      title="Float bottom header"
      :right="16"
      :bottom="16"
      :width="360"
      headerLocation="bottom"
    >
      <div class="panel">
        <p>Header is at the bottom.</p>
      </div>
    </DraggableItemFloat>

    <DraggableItemFloat
      show
      title="Float top header"
      :top="16"
      :left="16"
      :width="320"
      :maxHeight="420"
    >
      <div class="panel">
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    </DraggableItemFloat>
  </DraggableContainer>
</template>
