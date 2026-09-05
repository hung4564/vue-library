<template>
  <li
    class="layer-context-menu__item layer-context-menu__item--has-children"
    :class="{ 'is-open': open }"
    @click.stop="open = !open"
  >
    <div class="layer-context-menu__item-icon">
      <SvgIcon size="16" type="mdi" :path="mdiStar" />
    </div>
    <span>{{ 'name' in item ? item.name : 'Sample custom menu' }}</span>
    <div class="layer-context-menu__chevron">
      <SvgIcon size="16" type="mdi" :path="mdiChevronRight" />
    </div>
    <ul class="context-menu layer-context-menu layer-context-menu--submenu">
      <li class="layer-context-menu__item" @click.stop="onLog">
        <div class="layer-context-menu__item-icon">
          <SvgIcon size="16" type="mdi" :path="mdiInformation" />
        </div>
        <span>Log layer (keep open)</span>
      </li>
      <li class="layer-context-menu__item" @click.stop="onDone">
        <div class="layer-context-menu__item-icon">
          <SvgIcon size="16" type="mdi" :path="mdiClose" />
        </div>
        <span>Done (close menu)</span>
      </li>
    </ul>
  </li>
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronRight, mdiClose, mdiInformation, mdiStar } from '@mdi/js';
import { ref } from 'vue';

defineOptions({ name: 'SampleLayerMenu' });

const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data?: IListViewUI;
  mapId?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const open = ref(false);

function onLog() {
  console.info('[sample-layer-menu]', {
    mapId: props.mapId,
    layerId: props.data?.id,
    layerName: props.data?.getName?.(),
  });
}

function onDone() {
  emit('close');
}
</script>
