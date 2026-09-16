import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  ZoomControl,
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  ComponentManagementControl,
  HighlightPointer,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { loggerFactory } from '@hungpvq/shared-log';
import { MapPageShell } from '../components/MapPageShell';
import { loadHighlightDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';

loggerFactory.enable('map:highlight');
loggerFactory.enable('demo:highlight');

export function DatasetHighlightPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadHighlightDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <HighlightPointer enableClick enableHover />
        <ComponentManagementControl />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
