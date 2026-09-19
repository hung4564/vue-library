import type { MapSimple } from '@hungpvq/map-core';
import {
  applyHighlightDemoGlobalResolver,
  restoreHighlightDemoGlobalResolver,
} from '@hungpvq/demo-map-datasets';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  useMap,
  ZoomControl,
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  useMapHighlight,
} from '@hungpvq/react-map-dataset';
import { loggerFactory } from '@hungpvq/shared-log';
import { useEffect } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { loadHighlightDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

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
