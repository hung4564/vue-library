<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  WithMapPropType,
  WithShowProps,
} from '@hungpvq/vue-map-core';

import { DraggableItemFloat } from '@hungpvq/vue-draggable';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { watch } from 'vue';
import LayerListReadonly from './part/LayerListReadonly.vue';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'layer-info-control': {
      title: 'Layer Info Control',
    },
  },
});
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const [show, toggleShow] = useShow(props.show);
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapHomeControl',
  getState() {
    return {
      visible: !show.value,
      active: show.value,
      title: trans.value('map.layer-info-control.title'),
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemFloat
        v-bind="props"
        v-model:show="show"
        headerLocation="bottom"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.layer-control.title') }}
          </span>
        </template>
        <div class="layer-control">
          <LayerListReadonly :mapId="mapId" readonly />
          <div class="base-map-card-container">
            <slot name="endList" :mapId="mapId"> </slot>
          </div>
        </div>
      </DraggableItemFloat>
    </template>

    <slot />
  </ModuleContainer>
</template>

<style lang="scss">
.fill-height {
  height: 100%;
}
.layer-control {
  .map-row {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .map-co,
  .map-col-6,
  .map-col-12 {
    box-sizing: border-box;
    width: 100%;
  }
  .map-col {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
  }
  .map-col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .map-col-6 {
    flex: 0 0 calc(50% - 6px);
    max-width: 50%;
  }
}
</style>
<style scoped>
.layer-control {
  display: flex;
  flex-direction: column;
}
.layer-control-container {
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex-grow: 1;
}
.base-map-card-container {
  flex-grow: 0;
}
.layer-control__list {
  flex-grow: 1;
  overflow: auto;
  padding: 4px 12px 8px;
}
.layer-control {
  height: 100%;
  overflow: hidden;
}
.layer-control__title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.draggable-group__divider {
  padding: 4px 0;
  display: block;
  flex: 1 1 100%;
  height: 0px;
  max-height: 0px;
  opacity: 0.12;
  transition: inherit;
  border-style: solid;
  border-width: thin 0 0 0;
}
.layer-control__header {
  display: flex;
  align-items: center;
  padding: 8px;
}
.v-spacer {
  flex: 1 1 auto;
}
</style>
