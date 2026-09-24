import {
  applyHighlightDemoGlobalResolver,
  restoreHighlightDemoGlobalResolver,
} from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  useMap,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  useMapHighlight,
} from '@hungpvq/react-map-dataset';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';
import { loggerFactory } from '@hungpvq/shared-log';
import { useEffect } from 'react';

import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { loadHighlightDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

loggerFactory.enable('map:highlight');
loggerFactory.enable('demo:highlight');

function HighlightDemoBindings() {
  const { mapId } = useMap();
  const hl = useMapHighlight(mapId);

  useEffect(() => {
    applyHighlightDemoGlobalResolver();
    const unbind = hl.bindPointer({ click: false, hover: true });
    return () => {
      unbind();
      restoreHighlightDemoGlobalResolver();
    };
  }, [hl, mapId]);

  return null;
}

export function DatasetHighlightPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadHighlightDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DevtoolsControl position="bottom-right" />
        <HighlightDemoBindings />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <IdentifyControl position="top-right" immediately />
        <ComponentManagementControl />
        <ZoomControl />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
