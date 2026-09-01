import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { MapPageShell } from '../components/MapPageShell';
import { loadHighlightDemoDatasets } from '../data/highlight-datasets';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function DatasetHighlightPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadHighlightDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <LayerHighlight enableClick enableHover />
        <ComponentManagementControl />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
      </Map>
    </MapPageShell>
  );
}
