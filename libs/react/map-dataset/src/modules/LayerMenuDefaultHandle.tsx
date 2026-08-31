import type { WithMapPropType } from '@hungpvq/map-core';
import { fitBounds } from '@hungpvq/map-core';
import type {
  MenuClickAddComponent,
  MenuClickFitBounds,
  MenuClickHighlight,
  MenuItemProps,
} from '@hungpvq/map-dataset';
import {
  defaultMapProps,
  UniversalRegistry,
  useMap,
} from '@hungpvq/react-map-core';
import { useLayoutEffect, useRef } from 'react';
import { useMapDatasetComponent, useMapDatasetHighlight } from '../store';

export function LayerMenuDefaultHandle(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, callMap } = useMap(merged);
  const { addComponent } = useMapDatasetComponent(mapId);
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);

  const addComponentRef = useRef(addComponent);
  const callMapRef = useRef(callMap);
  const setFeatureHighlightRef = useRef(setFeatureHighlight);
  addComponentRef.current = addComponent;
  callMapRef.current = callMap;
  setFeatureHighlightRef.current = setFeatureHighlight;

  useLayoutEffect(() => {
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      'addComponent',
      ({ value }: MenuItemProps<MenuClickAddComponent>) => {
        if (value) addComponentRef.current(value);
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      'fitBounds',
      ({ value }: MenuItemProps<MenuClickFitBounds>) => {
        callMapRef.current((map) => {
          if (value?.detail) fitBounds(map, value.detail);
        });
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      'highlight',
      ({ value, layer }: MenuItemProps<MenuClickHighlight>) => {
        if (value)
          setFeatureHighlightRef.current(value.detail, value.key, layer);
      },
    );
  }, [mapId]);

  return null;
}
