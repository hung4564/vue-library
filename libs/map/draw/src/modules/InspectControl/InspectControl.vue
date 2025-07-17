<script lang="ts">
export default {
  name: 'inspect-control',
};
</script>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  EventClick,
  EventMouseMove,
  MapControlButton,
  ModuleContainer,
  useEventMap,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMap, mdiMapSearch } from '@mdi/js';
import { isEqual } from 'lodash';
import {
  PointLike,
  Popup,
  QueryRenderedFeaturesOptions,
  type MapMouseEvent,
  type MapSourceDataEvent,
  type StyleSpecification,
} from 'maplibre-gl';
import { computed, ref, shallowRef } from 'vue';
import { useMapDraw } from '../../store';
import { brightColor } from './colors';
import {
  getSourcesFromMap,
  isInspectStyle,
  markInspectStyle,
  type InspectStyleSpecification,
} from './inspect';
import _renderPopup from './renderPopup';
import { generateColoredLayers, generateInspectStyle } from './stylegen';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      showInspectDefault?: boolean;
      useInspectStyle?: boolean;
      showInspectMapPopup?: boolean;
      showInspectMapPopupOnHover?: boolean;
      showMapPopup?: boolean;
      showMapPopupOnHover?: boolean;
      blockHoverPopupOnClick?: boolean;
      buildInspectStyle?: (...args: any[]) => any;
      backgroundColor?: string;
      assignLayerColor?: (...args: any[]) => any;
      renderPopup?: (...args: any[]) => any;
      selectThreshold?: number;
      queryParameters?: QueryRenderedFeaturesOptions;
    }
  >(),
  {
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
  },
);
const _popup = shallowRef(
  new Popup({
    closeButton: false,
    closeOnClick: false,
  }),
);
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
);
const { getDrawIsShow } = useMapDraw(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
const showInspect = ref(props.showInspectDefault);
setLocaleDefault({
  map: {
    'inspect-control': {
      button: 'Toggle inspect',
    },
  },
});
const event = new EventClick().setHandler(onMapMouseMove);
const eventMouseMove = new EventMouseMove().setHandler(onMapMouseMove);
const _popupBlocked = ref(false);
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  event,
);
const { add: addEventMouseMove, remove: removeEventMouseMove } = useEventMap(
  mapId.value,
  eventMouseMove,
);
function onMapMouseMove(e: MapMouseEvent) {
  if (showInspect.value) {
    if (!props.showInspectMapPopup) return;
    if (e.type === 'mousemove' && !props.showInspectMapPopupOnHover) return;
    if (
      e.type === 'click' &&
      props.showInspectMapPopupOnHover &&
      props.blockHoverPopupOnClick
    ) {
      _popupBlocked.value = !_popupBlocked.value;
    }
  } else {
    if (!props.showMapPopup) return;
    if (e.type === 'mousemove' && !props.showMapPopupOnHover) return;
    if (
      e.type === 'click' &&
      props.showMapPopupOnHover &&
      props.blockHoverPopupOnClick
    ) {
      _popupBlocked.value = !_popupBlocked.value;
    }
  }

  if (!_popupBlocked.value && _popup.value) {
    let queryBox: PointLike | [PointLike, PointLike];
    if (props.selectThreshold === 0) {
      queryBox = e.point;
    } else {
      // set a bbox around the pointer
      queryBox = [
        [e.point.x - props.selectThreshold, e.point.y + props.selectThreshold], // bottom left (SW)
        [e.point.x + props.selectThreshold, e.point.y - props.selectThreshold], // top right (NE)
      ];
    }

    callMap((map) => {
      const features =
        map.queryRenderedFeatures(queryBox, props.queryParameters) || [];
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      if (!features.length) {
        _popup.value.remove();
      } else {
        _popup.value.setLngLat(e.lngLat);

        const renderedPopup = props.renderPopup(features);

        if (typeof renderedPopup === 'string') {
          _popup.value.setHTML(renderedPopup);
        } else {
          _popup.value.setDOMContent(renderedPopup);
        }

        _popup.value.addTo(map);
      }
    });
  }
}
function toggleInspect() {
  showInspect.value = !showInspect.value;
  if (showInspect.value) {
    addEventClick();
    addEventMouseMove();
  } else {
    _popup.value?.remove();
    removeEventClick();
    removeEventMouseMove();
  }
  callMap((map) => render(map));
}
const path = {
  map: mdiMap,
  inspect: mdiMapSearch,
};
let sources: { [key: string]: string[] } = {};
let _originalStyle: StyleSpecification | undefined;
const onSourceChange = (e: MapSourceDataEvent, map: MapSimple) => {
  if (e.sourceDataType === 'visibility' || !e.isSourceLoaded) {
    return;
  }
  const previousSources = Object.assign({}, sources);
  sources = getSourcesFromMap(map);

  if (!isEqual(previousSources, sources) && Object.keys(sources).length > 0) {
    // If the sources have changed, we need to re-render the inspect style but not too fast
    setTimeout(() => render(map), 1000);
  }
};
const onStyleChange = (map: MapSimple) => {
  const style = map.getStyle();
  if (!isInspectStyle(style as InspectStyleSpecification)) {
    _originalStyle = style;
  }
};
let _onSourceChange: any;
let _onStyleChange: any;
function onInit(map: MapSimple) {
  _onSourceChange = (e: MapSourceDataEvent) => onSourceChange(e, map);
  _onStyleChange = () => onStyleChange(map);
  // if sources have already been passed as options
  // we do not need to figure out the sources ourselves
  if (Object.keys(sources).length === 0) {
    map.on('tiledata', _onSourceChange);
    map.on('sourcedata', _onSourceChange);
  }

  map.on('styledata', _onStyleChange);
  map.on('load', _onStyleChange);
}
function onDestroy(map: MapSimple) {
  showInspect.value = false;
  map.off('styledata', _onSourceChange);
  map.off('load', _onSourceChange);
  map.off('tiledata', _onStyleChange);
  map.off('sourcedata', _onStyleChange);
  removeEventClick();
  removeEventMouseMove();
  render(map);
}
function render(map: MapSimple) {
  if (showInspect.value) {
    if (props.useInspectStyle) {
      map.setStyle(markInspectStyle(_inspectStyle(map)));
    }
  } else if (_originalStyle) {
    if (props.useInspectStyle) {
      map.setStyle(_originalStyle);
    }
  }
}
function _inspectStyle(map: MapSimple) {
  const coloredLayers = generateColoredLayers(
    sources,
    props.assignLayerColor as (layerId: string, alpha: number) => string,
  );
  return props.buildInspectStyle(map.getStyle(), coloredLayers, {
    backgroundColor: props.backgroundColor,
  });
}
const isDrawShow = computed(() => {
  return getDrawIsShow();
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        :tooltip="trans('map.inspect-control.button')"
        v-if="!isDrawShow"
      >
        <SvgIcon
          :size="18"
          type="mdi"
          @click="toggleInspect()"
          :path="!showInspect ? path.map : path.inspect"
        />
      </MapControlButton>
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
  color: #333;
  display: table;
  width: 100%;
}

.maplibregl-inspect_feature:not(:last-child) {
  border-bottom: 1px solid #ccc;
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
