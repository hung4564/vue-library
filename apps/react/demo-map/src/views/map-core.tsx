import {
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';

export function MapCorePage() {
  return (
    <MapPageShell>
      <Map>
        <AsideControl position="top-left" />
        <GotoControl position="top-right" />
        <CrsControl />
        <GlobeControl />
        <SettingControl />
        <FullScreenControl />
        <EventManagementControl />
        <ZoomControl />
        <HomeControl />
        <BaseMapControl position="bottom-left" />
        <GeoLocateControl position="top-right" />
        <MouseCoordinatesControl />
      </Map>
    </MapPageShell>
  );
}
