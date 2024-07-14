<template lang="">
  <component
    v-for="item in components_show"
    :key="item.id"
    :is="item.component()"
    v-bind="item.attr"
    @close="onRemoveComponent(item)"
  ></component>
</template>
<script setup lang="ts">
import { ILayerEvent, IListView } from '@hungpvq/vue-map-core';
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  shallowRef,
} from 'vue';
import { getLayerFromView } from '../../helper';
const instance = getCurrentInstance();
const props = defineProps<{ item: IListView }>();
const components_show = shallowRef<
  {
    component: any;
    id: string;
    attr: {
      item: IListView;
      option: any;
    };
  }[]
>([]);
function onRemoveComponent(item: { id: string }) {
  let index = components_show.value.findIndex((x) => x.id == item.id);
  if (index < 0) {
    return;
  }
  const component_show = components_show.value[index];
  getLayerFromView(props.item)
    ?.getView('component')
    .remove({ id: component_show.id });
  components_show.value.splice(index, 1);
  instance?.proxy?.$forceUpdate();
}
function onAddComponent({ component }: ILayerEvent['add-component']) {
  components_show.value.push({
    id: component.id,
    attr: {
      item: props.item,
      option: component.option,
    },
    component: component.component,
  });
  instance?.proxy?.$forceUpdate();
}
onMounted(() => {
  getLayerFromView(props.item)!.on('add-component', onAddComponent);
});
onBeforeUnmount(() => {
  getLayerFromView(props.item)!.off('add-component', onAddComponent);
});
</script>
