import {
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  LegendControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  SettingControl,
  ToolbarControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';

export function ToolbarPage() {
  return (
    <MapPageShell>
      <Map>
        <AsideControl position="top-left" />
        <ToolbarControl position="top-right" />
        <GotoControl position="top-right" controlLayout="toolbar" />
        <MeasurementControl position="top-left" />
        <CrsControl />
        <GlobeControl />
        <SettingControl />
        <FullScreenControl />
        <EventManagementControl />
        <ZoomControl controlLayout="toolbar" controlOrder={99} />
        <HomeControl controlLayout="toolbar" />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
        <GeoLocateControl position="top-right" />
        <LegendControl position="top-left" controlLayout="toolbar" controlOrder={5} />
        <PrintControl position="top-left" controlLayout="toolbar" />
        <PrintAdvancedControl position="top-left" controlLayout="toolbar" />
      </Map>
    </MapPageShell>
  );
}
