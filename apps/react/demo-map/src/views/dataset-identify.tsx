import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapCard, BaseMapControl, Map, ZoomControl } from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { MapPageShell } from '../components/MapPageShell';
import { loadIdentifyDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function DatasetIdentifyPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadIdentifyDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <ComponentManagementControl />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <IdentifyControl position="top-right" />
        <LayerHighlight enableClick />
        <IdentifyShowFirstControl />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
      </Map>
    </MapPageShell>
  );
}
