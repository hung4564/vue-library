import { BaseMapControl, Map, MeasurementControl } from '@hungpvq/react-map-core';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';

export function MeasurementPage() {
  return (
    <MapPageShell>
      <Map>
        <AsideControl position="top-left" />
        <MeasurementControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
