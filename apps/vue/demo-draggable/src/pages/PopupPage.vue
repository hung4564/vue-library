<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemPopup,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';

const containerId = ref('');
</script>

<template>
  <DraggableContainer
    containerId="demo-popup"
    class="demo-page"
    @init="(id) => (containerId = id)"
  >
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Popup demo</h2>
        <p>Draggable and resizable popups, including one outside the container.</p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemPopup
      show
      title="Popup 1"
      :top="20"
      :right="20"
      :width="300"
      :height="360"
    >
      <div class="panel">
        <p>Drag the header; resize from corners.</p>
      </div>
    </DraggableItemPopup>

    <DraggableItemPopup
      show
      title="Popup 2"
      :top="80"
      :left="80"
      :width="280"
      :height="240"
    >
      <div class="panel">
        <p>Second popup inside the container.</p>
      </div>
    </DraggableItemPopup>
  </DraggableContainer>

  <Teleport to="body" v-if="containerId">
    <DraggableItemPopup
      show
      title="Popup (Teleport)"
      :top="20"
      :left="420"
      :width="280"
      :height="220"
      :containerId="containerId"
    >
      <div class="panel">
        <p>Rendered via Teleport; same container state.</p>
      </div>
    </DraggableItemPopup>
  </Teleport>
</template>
