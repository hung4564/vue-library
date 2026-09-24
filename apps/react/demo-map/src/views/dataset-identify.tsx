import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
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
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <ComponentManagementControl />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <IdentifyControl position="top-right" />
        <IdentifyShowFirstControl />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
