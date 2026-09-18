<template lang="">
  <ModuleContainer v-bind="moduleContainerProps" :active="show">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

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
          <v-list-item v-for="item in navItems" :key="item.to">
            <RouterLink :to="item.to" @click="toggleShow(false)">{{
              item.label
            }}</RouterLink>
          </v-list-item>
        </v-list>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<script>
import { getDemoAsideNavItems } from '@hungpvq/demo-map-datasets';
import { VList, VListItem } from '@hungpvq/ui-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  makeShowProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  withMapProps,
} from '@hungpvq/vue-map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
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
    MapCommonButton,
  },
  props: {
    ...withMapProps,
    ...makeShowProps({ show: false }),
  },
  setup(props) {
    const path = {
      icon: mdiMenu,
    };
    const [show, toggleShow] = useShow(props.show);
    const { mapId, moduleContainerProps } = useMap({
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

    const { state, control } = useToolbarControl(mapId.value, props, {
      id: 'asideControl',
      getState() {
        return mdiButtonState(path.icon, {
          visible: true,
          title: trans.value('map.aside-control.title'),
        });
      },
      onClick() {
        toggleShow();
      },
    });
    return {
      state,
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
