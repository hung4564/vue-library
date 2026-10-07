<template lang="">
  <ModuleContainer
    v-bind="moduleContainerProps"
    :active="show"
  >
    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.aside-control.title')"
      >
        <template #title>
          <span class="aside-control__title">
            {{ trans('map.aside-control.title') }}
          </span>
        </template>
        <v-list>
          <v-list-item
            v-for="item in navItems"
            :key="item.to"
          >
            <RouterLink
              :to="item.to"
              @click="toggleShow(false)"
              >{{ item.label }}</RouterLink
            >
          </v-list-item>
        </v-list>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<script lang="ts">
import { getDemoAsideNavItems } from '@hungpvq/demo-map-datasets';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { VList, VListItem } from '@hungpvq/ui-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  makeShowProps,
  ModuleContainer,
  useLang,
  useMap,
  useMapControl,
  useShow,
  withMapProps,
} from '@hungpvq/vue-map-core';
import { mdiMenu } from '@mdi/js';
import { RouterLink } from 'vue-router';
export default {
  name: 'AsideControl',
  components: {
    VList,
    DraggableItemSideBar,
    ModuleContainer,
    VListItem,
    RouterLink,
  },
  props: {
    ...withMapProps({ position: 'top-left' }),
    ...makeShowProps({ show: false }),
  },
  setup(props) {
    const path = {
      icon: mdiMenu,
    };
    const [show, toggleShow] = useShow(props.show);
    const { mapId, order } = useMap({
      ...props,
      controlId: 'asideControl',
    });
    const { trans, registerLocale } = useLang(mapId.value);

    registerLocale('en', {
      map: {
        'aside-control': {
          title: 'Aside Control',
        },
      },
    });
    const singleButton = {
      kind: 'single',
      getState() {
        return mdiButtonState(path.icon, {
          visible: true,
          active: show.value,
          title: trans.value('map.aside-control.title'),
          order: order.value,
        });
      },
      onClick() {
        toggleShow();
      },
    };
    const { moduleContainerProps, control } = useMapControl(mapId, {
      id: 'asideControl',
      panelKind: 'sidebar',
      title: () => trans.value('map.aside-control.title'),
      from: props,
      order,
      show,
      setShow: (value) => toggleShow(value),
      actions: [
        {
          type: 'asideControl',
          run: () => toggleShow(),
        },
      ],
      host: { button: singleButton },
      toolbar: singleButton,
    });

    return {
      control,
      show,
      toggleShow,
      moduleContainerProps,
      trans,
      path,
      navItems: getDemoAsideNavItems('vue'),
    };
  },
};
</script>
<style lang=""></style>
