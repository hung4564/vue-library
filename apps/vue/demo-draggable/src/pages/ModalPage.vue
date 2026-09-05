<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableModal,
  ManagementControl,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';

const showOuter = ref(true);
const showInner = ref(false);
const showThird = ref(false);
</script>

<template>
  <DraggableContainer containerId="demo-modal" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Modal demo</h2>
        <p>
          Open a nested modal from inside another. Later opens stack on top.
        </p>
        <div class="actions">
          <button type="button" class="demo-btn" @click="showOuter = true">
            Open outer modal
          </button>
          <button type="button" class="demo-btn" @click="showThird = true">
            Open sibling modal
          </button>
        </div>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableModal
      v-model:show="showOuter"
      title="Outer modal"
      :width="440"
      :height="280"
      :maskClosable="false"
    >
      <div class="panel">
        <p>This is the outer modal. Open a child modal from here:</p>
        <div class="actions">
          <button type="button" class="demo-btn" @click="showInner = true">
            Open nested modal
          </button>
        </div>
      </div>
    </DraggableModal>

    <DraggableModal
      v-model:show="showInner"
      title="Nested modal"
      :width="340"
      :height="220"
      :top="120"
      :left="180"
      :center="false"
      :maskClosable="true"
    >
      <div class="panel">
        <p>
          Nested modal opened from the outer one — stacks above by open order.
        </p>
        <button type="button" class="demo-btn" @click="showInner = false">
          Close nested
        </button>
      </div>
    </DraggableModal>

    <DraggableModal
      v-model:show="showThird"
      title="Sibling modal"
      :width="320"
      :height="200"
      :top="160"
      :left="260"
      :center="false"
    >
      <div class="panel">
        <p>Opened from the control panel (sibling, not nested).</p>
      </div>
    </DraggableModal>
  </DraggableContainer>
</template>
