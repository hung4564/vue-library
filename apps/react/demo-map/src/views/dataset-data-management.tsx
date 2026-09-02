import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapCard, BaseMapControl, EventManagementControl, Map } from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { MapPageShell } from '../components/MapPageShell';
import { loadDataManagementDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function DatasetDataManagementPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadDataManagementDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" defaultBaseMap="Google Satellite" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <ComponentManagementControl />
        <EventManagementControl position="top-left" />
        <IdentifyControl position="top-right" />
      </Map>
    </MapPageShell>
  );
}
