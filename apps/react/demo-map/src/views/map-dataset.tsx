import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GlobeControl,
  HomeControl,
  LegendControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { loadAllMapDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

/** Alias of full dataset demo — same as home but reachable via /map-dataset */
export function MapDatasetPage() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadAllMapDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <GlobeControl />
        <CrsControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
        <LegendControl position="bottom-right" />
        <MeasurementControl position="bottom-right" />
        <PrintControl position="bottom-right" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <DatasetControl position="top-left" />
        <IdentifyControl position="top-right" />
        <EventManagementControl position="top-left" />
        <ComponentManagementControl />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
