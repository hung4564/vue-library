import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapCard, BaseMapControl, Map, ZoomControl } from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { MapPageShell } from '../components/MapPageShell';
import { loadListDemoDatasets } from '../data/sample-datasets';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function DatasetListPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadListDemoDatasets(map.id);
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
        <LayerHighlight enableClick />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
      </Map>
    </MapPageShell>
  );
}
