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
  SettingControl,
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
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { RegistryControlDemo } from './RegistryControlDemo';
import './registry-control-demo.css';

export function RegistryControlPage() {
  useDatasetRegistry();

  return (
    <MapPageShell>
      <div className="registry-control-demo">
        <Map>
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
          <IdentifyControl position="top-right" />
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
          <LayerHighlight />

          <RegistryControlDemo position="top-right" show />
        </Map>
      </div>
    </MapPageShell>
  );
}
