import type { MapSimple } from '@hungpvq/map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import {
  BaseMapCard,
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  InfoControl,
  LegendControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { MapPageShell } from '../components/MapPageShell';
import { loadAllMapDatasets } from '../data/all-map-datasets';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function AllMapView() {
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    loadAllMapDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <ComponentManagementControl />
        <MeasurementControl position="top-right" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <IdentifyControl position="top-right" />
        <PrintAdvancedControl />
        <PrintControl />
        <GotoControl position="top-right" />
        <InfoControl position="top-right" />
        <GlobeControl />
        <LegendControl />
        <CrsControl />
        <SettingControl />
        <GeoLocateControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
        <IdentifyShowFirstControl />
        <LayerHighlight />
        <DatasetControl position="top-left" />
        <EventManagementControl position="top-left" />
      </Map>
    </MapPageShell>
  );
}
