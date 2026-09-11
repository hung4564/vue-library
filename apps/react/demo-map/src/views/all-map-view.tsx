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
  MapContextMenuControl,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  RegistryControl,
  SettingControl,
  ThemeControl,
  ToolbarControl,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { DrawControl, InspectControl } from '@hungpvq/react-map-draw';
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function AllMapView() {
  useDatasetRegistry();

  return (
    <MapPageShell>
      <Map buttonInMobile="toolbar">
        <AsideControl position="top-left" />
        <ToolbarControl position="top-left" />
        <ComponentManagementControl />
        <MeasurementControl position="top-right" />
        <IdentifyControl position="top-right" />
        <DrawControl position="top-right" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <InspectControl position="top-right" />
        <PrintAdvancedControl />
        <PrintControl />
        <GotoControl position="top-right" />
        <InfoControl position="top-right" />
        <RegistryControl position="top-right" />
        <WorkerControl position="top-left" />
        <GlobeControl />
        <LegendControl />
        <CrsControl />
        <SettingControl />
        <ThemeControl />
        <GeoLocateControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <MapContextMenuControl />
        <BaseMapControl position="bottom-left" />
        <IdentifyShowFirstControl />
        <LayerHighlight />
        <DatasetControl position="top-left" />
        <EventManagementControl position="top-left" />
      </Map>
    </MapPageShell>
  );
}
