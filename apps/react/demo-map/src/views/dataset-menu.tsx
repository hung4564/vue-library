import type { MapSimple } from '@hungpvq/map-core';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset';
import { DEMO_LAYER_TOGGLE_SHOW_KEY } from '@hungpvq/demo-map-datasets';
import { getUUIDv4 } from '@hungpvq/shared';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  UniversalRegistry,
  ThemeControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { useMemo } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { loadMenuDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { SampleLayerToggleShow } from './sample-layer-toggle-show';
import { SampleToggleShowButton } from './sample-toggle-show-button';

function registerDemoToggleComponents(mapId: string) {
  /**
   * Map-wide button UI: ON/OFF via toggleShowButton.
   * Per-layer: register a full ToggleShow (logic+UI) and override menu componentKey.
   *
   * Must run on map load: React StrictMode calls removeMap() which clears
   * map-scoped registry, so render-time registration alone is not enough.
   */
  UniversalRegistry.registerComponentForMap(
    mapId,
    LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton,
    SampleToggleShowButton,
  );
  UniversalRegistry.registerComponentForMap(
    mapId,
    DEMO_LAYER_TOGGLE_SHOW_KEY,
    SampleLayerToggleShow,
  );
}

export function DatasetMenuPage() {
  useDatasetRegistry();
  const mapId = useMemo(() => getUUIDv4(), []);

  function onMapLoaded(map: MapSimple) {
    registerDemoToggleComponents(map.id);
    loadMenuDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map mapId={mapId} onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId: id }) => <BaseMapCard mapId={id} />}
        />
        <LayerHighlight enableClick />
        <IdentifyControl position="top-right" />
        <ComponentManagementControl />
        <ThemeControl />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
      </Map>
    </MapPageShell>
  );
}
