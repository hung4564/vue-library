<script lang="ts">
export default { name: 'DragDebugViewer' };
</script>

<script setup lang="ts">
import {
  applyDragDebugAction,
  canMove,
  canStack,
  detailRows,
  listDragDebugItems,
  rowKey,
  useDragStore,
  type DragDebugItem,
  type LocationSideBar,
} from '@hungpvq/draggable';
import {
  DevtoolPanelCard,
  DevtoolPanelContainer,
  DevtoolPanelSplit,
  DevtoolPanelToolbar,
} from '@hungpvq/vue-shared-log';
import {
  BaseButton,
  InputCheckbox,
  InputSelect,
  List,
  ListItem,
} from '@hungpvq/vue-ui-core';
import { computed, ref } from 'vue';

const LOCATIONS: LocationSideBar[] = ['left', 'right', 'top', 'bottom'];

const store = useDragStore();
const selectedKey = ref('');

const items = computed(() => {
  void store.container;
  void store.debugOrigins;
  return listDragDebugItems();
});

const selected = computed(
  () => items.value.find((row) => rowKey(row) === selectedKey.value) ?? null,
);

const locationItems = LOCATIONS.map((side) => ({ value: side, text: side }));

function setShow(row: DragDebugItem, show: boolean) {
  applyDragDebugAction({
    type: 'show',
    containerId: row.containerId,
    id: row.id,
    show,
  });
}

function setLocation(row: DragDebugItem, location: LocationSideBar) {
  applyDragDebugAction({
    type: 'location',
    containerId: row.containerId,
    id: row.id,
    location,
  });
}
</script>

<template>
  <DevtoolPanelContainer>
    <template #title>
      <DevtoolPanelToolbar>
        <template #title>
          <span class="drag-debug-viewer__count">{{ items.length }} items</span>
        </template>
      </DevtoolPanelToolbar>
    </template>
    <div class="drag-debug-viewer__container">
      <DevtoolPanelSplit class="drag-debug-viewer__split">
        <DevtoolPanelCard class="drag-debug-viewer__list">
          <div
            v-if="items.length === 0"
            class="drag-debug-viewer__empty"
          >
            No declared draggable items
          </div>
          <List
            v-else
            dense
            divided
          >
            <ListItem
              v-for="row in items"
              :key="rowKey(row)"
              :selected="selectedKey === rowKey(row)"
              interactive
              dense
              @click="selectedKey = rowKey(row)"
            >
              <template #prefix>
                <InputCheckbox
                  :model-value="row.show"
                  :aria-label="`Show ${row.title || row.id}`"
                  @click.stop
                  @update:model-value="setShow(row, !!$event)"
                />
              </template>
              <div class="drag-debug-viewer__meta">
                <div class="drag-debug-viewer__title">
                  {{ row.title || row.id }}
                </div>
                <div class="drag-debug-viewer__sub">
                  {{ row.type }}
                </div>
              </div>
            </ListItem>
          </List>
        </DevtoolPanelCard>
        <DevtoolPanelCard class="drag-debug-viewer__detail">
          <template v-if="selected">
            <div class="drag-debug-viewer__detail-h">
              <strong>{{ selected.title || selected.id }}</strong>
            </div>

            <div
              class="drag-debug-viewer__actions"
              @click.stop
            >
              <InputSelect
                v-if="canMove(selected)"
                :model-value="selected.location || 'left'"
                :aria-label="`Location ${selected.title || selected.id}`"
                :items="locationItems"
                @update:model-value="
                  setLocation(selected, $event as LocationSideBar)
                "
              />
              <template v-if="canStack(selected)">
                <BaseButton
                  @click="
                    applyDragDebugAction({
                      type: 'front',
                      containerId: selected.containerId,
                      id: selected.id,
                    })
                  "
                >
                  Front
                </BaseButton>
                <BaseButton
                  @click="
                    applyDragDebugAction({
                      type: 'back',
                      containerId: selected.containerId,
                      id: selected.id,
                    })
                  "
                >
                  Back
                </BaseButton>
              </template>
              <BaseButton
                @click="
                  applyDragDebugAction({
                    type: 'highlight',
                    containerId: selected.containerId,
                    id: selected.id,
                  })
                "
              >
                Find
              </BaseButton>
            </div>
            <div
              v-for="[key, value] in detailRows(selected)"
              :key="key"
              class="debug-list-item"
            >
              <span class="debug-list-item-label">{{ key }}</span>
              <code class="debug-list-item-value">{{ value }}</code>
            </div>
          </template>
          <div
            v-else
            class="drag-debug-viewer__empty"
          >
            Select an item to inspect
          </div>
        </DevtoolPanelCard>
      </DevtoolPanelSplit>
    </div>
  </DevtoolPanelContainer>
</template>
