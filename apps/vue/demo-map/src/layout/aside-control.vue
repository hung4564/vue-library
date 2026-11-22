<template>
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
        <ul class="aside-control__nav">
          <li
            v-for="item in navItems"
            :key="item.to"
            class="aside-control__item"
          >
            <RouterLink
              :to="item.to"
              @click="toggleShow(false)"
              >{{ item.label }}</RouterLink
            >
          </li>
        </ul>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<script lang="ts">
import { getDemoAsideNavItems } from '@hungpvq/demo-map-datasets';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
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
    DraggableItemSideBar,
    ModuleContainer,
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
<style>
/* Teleported into the sidebar — keep unscoped so chrome CSS cannot drop the nav. */
.aside-control__title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aside-control__nav {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
}

.aside-control__item {
  margin: 0;
  padding: 0.75rem 1rem !important;
  cursor: pointer;
}

.aside-control__item > a {
  display: block;
  color: inherit;
  text-decoration: none;
}

.aside-control__item:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

.aside-control__item:active,
.aside-control__item:has(a.router-link-active) {
  background-color: color-mix(in srgb, currentColor 18%, transparent);
}
</style>
