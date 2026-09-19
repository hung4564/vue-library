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
  WorkerControl,
  ZoomControl,
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { DrawControl, InspectControl } from '@hungpvq/react-map-draw';
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

export function RegistryControlPage() {
  useDatasetRegistry();

  return (
    <MapPageShell>
      <Map>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <MeasurementControl position="top-right" />
        <ComponentManagementControl />

        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <DatasetControl position="top-left" />
        <EventManagementControl position="top-left" />

        <GotoControl position="top-right" />
        <InfoControl position="top-right" />
        <WorkerControl position="top-left" />
        <IdentifyControl position="top-right" />
        <DrawControl position="top-right" />
        <InspectControl position="top-right" />
        <GeoLocateControl position="top-right" />

        <PrintAdvancedControl />
        <PrintControl />
        <LegendControl />
        <CrsControl />
        <SettingControl />
        <GlobeControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <MapContextMenuControl />
        <BaseMapControl position="bottom-left" />

        <IdentifyShowFirstControl />

        <RegistryControl position="top-right" show />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
