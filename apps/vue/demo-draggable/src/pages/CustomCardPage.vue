<script setup lang="ts">
import {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  DraggableModal,
  ManagementControl,
  useDragComponent,
} from '@hungpvq/vue-draggable';
import { onBeforeMount, onUnmounted, ref } from 'vue';
import GlobalCard from '../components/custom-cards/GlobalCard.vue';
import GlobalHeader from '../components/custom-cards/GlobalHeader.vue';
import LocalCard from '../components/custom-cards/LocalCard.vue';
import LocalHeader from '../components/custom-cards/LocalHeader.vue';

const cards = useDragComponent();
const showModal = ref(true);
const drawerSize = ref(260);

onBeforeMount(() => {
  cards.setComponentCard(GlobalCard);
  cards.setComponentCardHeader(GlobalHeader);
});

// Clear only after children unmount — clearing in onBeforeUnmount swaps card
// components while Teleports still point at sidebar targets (HMR crash).
onUnmounted(() => {
  cards.clearAllComponentCards();
});
</script>

<template>
  <DraggableContainer containerId="demo-custom-card" class="demo-page">
    <DraggableItemSideBar show title="Controls" location="left">
      <div class="panel">
        <h2>Custom card</h2>
        <p>
          Green cards come from the global store. Orange cards use local
          <code>componentCard</code> props (override global).
        </p>
        <ManagementControl />
      </div>
    </DraggableItemSideBar>

    <DraggableItemSideBar show title="Sidebar (global)" location="right">
      <div class="panel">
        <p>Sidebar uses global card (store) — no local override API on shell.</p>
      </div>
    </DraggableItemSideBar>

    <DraggableItemPopup
      show
      title="Popup (global)"
      :top="12"
      :right="12"
      :width="260"
      :height="200"
    >
      <div class="panel">Uses global custom card.</div>
    </DraggableItemPopup>

    <DraggableItemPopup
      show
      title="Popup (local)"
      :top="230"
      :right="12"
      :width="260"
      :height="200"
      :componentCard="LocalCard"
      :componentCardHeader="LocalHeader"
    >
      <div class="panel">Local override on popup.</div>
    </DraggableItemPopup>

    <DraggableItemFloat
      show
      title="Float (global)"
      :left="12"
      :bottom="12"
      :width="280"
    >
      <div class="panel">Uses global custom card.</div>
    </DraggableItemFloat>

    <DraggableItemFloat
      show
      title="Float (local)"
      :left="310"
      :bottom="12"
      :width="280"
      :componentCard="LocalCard"
      :componentCardHeader="LocalHeader"
    >
      <div class="panel">Local override on float.</div>
    </DraggableItemFloat>

    <DraggableDrawer
      show
      title="Drawer (global)"
      location="bottom"
      v-model:size="drawerSize"
      :min-size="140"
      :max-size="360"
    >
      <div class="panel">Drawer with global card.</div>
    </DraggableDrawer>

    <DraggableModal
      v-model:show="showModal"
      title="Modal (local)"
      :width="360"
      :height="200"
      :componentCard="LocalCard"
      :componentCardHeader="LocalHeader"
    >
      <div class="panel">Modal with local custom card.</div>
    </DraggableModal>
  </DraggableContainer>
</template>
