<template lang="">
  <ModuleContainer v-bind="moduleContainerProps" :active="show">
    <template #btn>
      <MapControlButton
        @click.stop="toggleShow()"
        :tooltip="trans('map.aside-control.title')"
      >
        <SvgIcon size="16" type="mdi" :path="path.icon" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
      >
        <template #title>
          <span class="aside-control__title">
            {{ trans('map.aside-control.title') }}
          </span>
        </template>
        <v-list>
          <v-list-item>
            <RouterLink to="/">Home </RouterLink>
          </v-list-item>
          <v-list-item>
            <RouterLink to="/basemap">BaseMap </RouterLink>
          </v-list-item>
          <v-list-item>
            <RouterLink to="/draw">draw </RouterLink>
          </v-list-item>
          <v-list-item>
            <RouterLink to="/Layer">layer </RouterLink>
          </v-list-item>
          <v-list-item>
            <RouterLink to="/measurement">measurement </RouterLink>
          </v-list-item>
        </v-list>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<script lang="ts">
import { VList, VListItem } from '@hungpvq/ui-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  makeShowProps,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMenu } from '@mdi/js';
import { RouterLink } from 'vue-router';
export default {
  components: {
    VList,
    DraggableItemSideBar,
    MapControlButton,
    ModuleContainer,
    SvgIcon,
    VListItem,
    RouterLink,
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
    const { mapId, moduleContainerProps } = useMap(props);
    const { trans, setLocale } = useLang(mapId.value);

    setLocale({
      map: {
        'aside-control': {
          title: 'Aside Control',
        },
      },
    });
    return {
      show,
      toggleShow,
      moduleContainerProps,
      trans,
      path,
    };
  },
};
</script>
<style lang=""></style>
