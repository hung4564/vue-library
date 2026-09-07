<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuItem,
  DraggableContainer,
  DraggableItemSideBar,
} from '@hungpvq/vue-draggable';
import { ref } from 'vue';

type MenuAction = 'open' | 'rename' | 'share' | 'delete' | 'disabled';

const menuRef = ref<{
  open: (e: MouseEvent) => void;
  close: () => void;
} | null>(null);

const lastAction = ref<string>('—');
const activeId = ref<MenuAction>('open');

const items: {
  id: MenuAction;
  label: string;
  disabled?: boolean;
}[] = [
  { id: 'open', label: 'Open' },
  { id: 'rename', label: 'Rename' },
  { id: 'share', label: 'Share' },
  { id: 'delete', label: 'Delete' },
  { id: 'disabled', label: 'Disabled action', disabled: true },
];

function openMenu(e: MouseEvent) {
  e.preventDefault();
  menuRef.value?.open(e);
}

function onSelect(id: MenuAction) {
  if (id === 'disabled') return;
  activeId.value = id;
  lastAction.value = id;
  menuRef.value?.close();
}
</script>

<template>
  <DraggableContainer containerId="demo-menu" class="demo-page" variant="plain">
    <DraggableItemSideBar show title="Menu demo" location="left">
      <div class="panel">
        <h2>ContextMenu + ContextMenuItem</h2>
        <p>
          Experimental menu chrome: <code>role="menu"</code> /
          <code>menuitem</code>, Esc, Arrow Up/Down, Home/End, Enter/Space.
        </p>
        <ul class="demo-list">
          <li><strong>Right-click</strong> the canvas → open at pointer.</li>
          <li>
            <strong>Click</strong> “Open from button” → same menu API
            (<code>ref.open(event)</code>).
          </li>
          <li><strong>Active</strong> item uses <code>active</code> prop.</li>
          <li>
            <strong>Disabled</strong> item uses <code>disabled</code> (skipped by
            keyboard).
          </li>
          <li>After open, try Arrow keys then Enter to activate.</li>
        </ul>
        <div class="actions">
          <button type="button" class="demo-btn" @click="openMenu">
            Open from button
          </button>
        </div>
        <p>
          Last action: <strong>{{ lastAction }}</strong>
        </p>
      </div>
    </DraggableItemSideBar>

    <div class="menu-canvas" @contextmenu="openMenu">
      <p class="menu-canvas__hint">
        Right-click anywhere here, or use the button in the sidebar.
      </p>
    </div>

    <ContextMenu ref="menuRef">
      <ul class="context-menu">
        <ContextMenuItem
          v-for="item in items"
          :key="item.id"
          :active="activeId === item.id"
          :disabled="item.disabled"
          @click="onSelect(item.id)"
        >
          {{ item.label }}
        </ContextMenuItem>
      </ul>
    </ContextMenu>
  </DraggableContainer>
</template>
