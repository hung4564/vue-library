import type { MapSimple } from '@hungpvq/map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
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
import { loadAllMapDatasets } from '../data/all-map-datasets';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { MapPageShell } from '../components/MapPageShell';
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
        <LayerHighlight enableClick />
        <ComponentManagementControl />
      </Map>
    </MapPageShell>
  );
}
