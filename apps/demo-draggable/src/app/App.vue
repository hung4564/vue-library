<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';
const containerId = ref('');
function init(id) {
  containerId.value = id;
}
function onChangeShow(value) {
  console.log('onChangeShow', value);
}
</script>

<template>
  <DraggableContainer
    containerId="test"
    @init="init"
    @change-show="onChangeShow"
  >
    <DraggableItemSideBar show title="right sidebar 1" location="right">
      <div style="height: 100vh">right sidebar 1</div>
    </DraggableItemSideBar>
    <DraggableItemSideBar show title="right sidebar 2" location="right">
      <div style="height: 100vh">right sidebar 2</div>
    </DraggableItemSideBar>
    <DraggableItemSideBar show title="left sidebar 2">
      <ManagementControl />
    </DraggableItemSideBar>

    <DraggableItemPopup show title="Popup 1" :top="10" :right="10">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
    <DraggableItemFloat
      show
      title="popup 1"
      :right="10"
      :bottom="10"
      :width="400"
      headerLocation="bottom"
    >
      <div style="height: 100vh"></div>
    </DraggableItemFloat>
  </DraggableContainer>
  <Teleport :to="`#${containerId}`" v-if="containerId">
    <DraggableItemPopup
      show
      title="Popup 2 is outside the container and outside the container"
      :top="10"
      :left="410"
      :containerId="containerId"
    >
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
  </Teleport>
</template>
<style>
body,
html,
#root {
  height: 100%;
}
html {
  height: 100%;
  position: relative;
  overflow: hidden !important;
}

body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
