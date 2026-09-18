import {
  BaseMapControl,
  CrsControl,
  Map,
  MouseCoordinatesControl,
} from '@hungpvq/react-map-core';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';

export function CrsPage() {
  return (
    <MapPageShell>
      <Map>
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <CrsControl />
        <MouseCoordinatesControl />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
