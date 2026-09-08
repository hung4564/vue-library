<script lang="ts">
export default {
  name: 'inspect-control',
};
</script>
<script setup lang="ts">
import {
  EventClick,
  EventMouseMove,
  type MapControlButtonUIState,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  InspectController,
  brightColor,
  generateInspectStyle,
  renderPopup as _renderPopup,
  type InspectControllerOptions,
} from '@hungpvq/map-draw';
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useEventMap,
  useLang,
  useMap,
  useRegisterMapControl,
  useToolbarControl,
} from '@hungpvq/vue-map-core';
import { mdiMap, mdiMapSearch } from '@mdi/js';
import type { QueryRenderedFeaturesOptions } from 'maplibre-gl';
import { ref } from 'vue';
import { INSPECT_CONTROL_LOCALE } from '../../locale';

/** Local interface so Vue resolve props used in withDefaults / defaultMapProps. */
interface InspectControlProps extends WithMapPropType {
  // Keys present in defaultMapProps (Vue needs them declared on this SFC type)
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  position?: WithMapPropType['position'];
  controlVisible?: boolean;
  showInspectDefault?: boolean;
  useInspectStyle?: boolean;
  showInspectMapPopup?: boolean;
  showInspectMapPopupOnHover?: boolean;
  showMapPopup?: boolean;
  showMapPopupOnHover?: boolean;
  blockHoverPopupOnClick?: boolean;
  buildInspectStyle?: InspectControllerOptions['buildInspectStyle'];
  backgroundColor?: string;
  assignLayerColor?: InspectControllerOptions['assignLayerColor'];
  renderPopup?: InspectControllerOptions['renderPopup'];
  selectThreshold?: number;
  queryParameters?: QueryRenderedFeaturesOptions;
}

const props = withDefaults(defineProps<InspectControlProps>(), {
  ...defaultMapProps,
  showInspectDefault: false,
  useInspectStyle: true,
  showInspectMapPopup: true,
  showInspectMapPopupOnHover: false,
  showMapPopup: false,
  showMapPopupOnHover: true,
  blockHoverPopupOnClick: false,
  buildInspectStyle: generateInspectStyle,
  backgroundColor: '#fff',
  assignLayerColor: brightColor,
  renderPopup: _renderPopup,
  selectThreshold: 5,
  queryParameters: () => ({}),
});

const showInspect = ref(props.showInspectDefault);
const path = {
  map: mdiMap,
  inspect: mdiMapSearch,
};

const controller = new InspectController({
  showInspectMap: props.showInspectDefault,
  useInspectStyle: props.useInspectStyle,
  showInspectMapPopup: props.showInspectMapPopup,
  showInspectMapPopupOnHover: props.showInspectMapPopupOnHover,
  showMapPopup: props.showMapPopup,
  showMapPopupOnHover: props.showMapPopupOnHover,
  blockHoverPopupOnClick: props.blockHoverPopupOnClick,
  buildInspectStyle: props.buildInspectStyle,
  backgroundColor: props.backgroundColor,
  assignLayerColor: props.assignLayerColor,
  renderPopup: props.renderPopup,
  selectThreshold: props.selectThreshold,
  queryParameters: props.queryParameters,
  onToggle: (show) => {
    showInspect.value = show;
    syncPointerEvents();
    control.sync();
  },
});

const clickEvent = new EventClick().setHandler(controller.handlePointerEvent);
const moveEvent = new EventMouseMove().setHandler(
  controller.handlePointerEvent,
);

const { mapId, moduleContainerProps, order } = useMap(
  props,
  onInit,
  onDestroy,
);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(INSPECT_CONTROL_LOCALE);

const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  clickEvent,
);
const { add: addEventMouseMove, remove: removeEventMouseMove } = useEventMap(
  mapId.value,
  moveEvent,
);

function syncPointerEvents() {
  removeEventClick();
  removeEventMouseMove();
  if (controller.needsClickEvent()) {
    addEventClick();
  }
  if (controller.needsHoverEvent()) {
    addEventMouseMove();
  }
}

function onInit(map: MapSimple) {
  controller.attach(map);
  syncPointerEvents();
}
function onDestroy() {
  removeEventClick();
  removeEventMouseMove();
  controller.detach();
}

function toggleInspect() {
  controller.toggle();
}

useRegisterMapControl(mapId, {
  id: 'mapInspectControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapInspectControl',
      run: () => {
        toggleInspect();
      },
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapInspectControl',
  getState(): MapControlButtonUIState {
    return {
      visible: true,
      title: trans.value('map.inspect-control.button'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: !showInspect.value ? path.map : path.inspect,
      },
    };
  },
  onClick() {
    toggleInspect();
  },
});
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
    <slot />
  </ModuleContainer>
</template>
<style>
.maplibregl-inspect_popup-container {
  max-height: min(500px, 50vh);
  overflow-y: auto;
  min-width: 200px;
}
.maplibregl-inspect_popup {
  color: var(--map-inspect-text, var(--map-text-primary, #333));
  display: table;
  width: 100%;
}

.maplibregl-inspect_feature:not(:last-child) {
  border-bottom: 1px solid
    var(--map-inspect-border, var(--map-border-color, #ccc));
}

.maplibregl-inspect_layer:before {
  content: '#';
}

.maplibregl-inspect_layer {
  display: block;
  font-weight: bold;
}

.maplibregl-inspect_property {
  display: table-row;
}

.maplibregl-inspect_property-value {
  display: table-cell;
  word-break: break-all;
}

.maplibregl-inspect_property-name {
  display: table-cell;
  padding-right: 10px;
  word-break: break-all;
}

.maplibregl-ctrl-inspect {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23333333' preserveAspectRatio='xMidYMid meet' viewBox='-10 -10 60 60'%3E%3Cg%3E%3Cpath d='m15 21.6q0-2 1.5-3.5t3.5-1.5 3.5 1.5 1.5 3.5-1.5 3.6-3.5 1.4-3.5-1.4-1.5-3.6z m18.4 11.1l-6.4-6.5q1.4-2.1 1.4-4.6 0-3.4-2.5-5.8t-5.9-2.4-5.9 2.4-2.5 5.8 2.5 5.9 5.9 2.5q2.4 0 4.6-1.4l7.4 7.4q-0.9 0.6-2 0.6h-20q-1.3 0-2.3-0.9t-1.1-2.3l0.1-26.8q0-1.3 1-2.3t2.3-0.9h13.4l10 10v19.3z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

.maplibregl-ctrl-map {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23333333' viewBox='-10 -10 60 60' preserveAspectRatio='xMidYMid meet'%3E%3Cg%3E%3Cpath d='m25 31.640000000000004v-19.766666666666673l-10-3.511666666666663v19.766666666666666z m9.140000000000008-26.640000000000004q0.8599999999999923 0 0.8599999999999923 0.8600000000000003v25.156666666666666q0 0.625-0.625 0.783333333333335l-9.375 3.1999999999999993-10-3.5133333333333354-8.906666666666668 3.4383333333333326-0.2333333333333334 0.07833333333333314q-0.8616666666666664 0-0.8616666666666664-0.8599999999999994v-25.156666666666663q0-0.625 0.6233333333333331-0.7833333333333332l9.378333333333334-3.198333333333334 10 3.5133333333333336 8.905000000000001-3.4383333333333344z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}
</style>
