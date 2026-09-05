import { BaseMapControl, Map } from '@hungpvq/react-map-core';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './stub-page.css';

export function InspectPage() {
  return (
    <MapPageShell>
      <Map>
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
      </Map>
      <div className="stub-banner">
        <strong>Draw / InspectControl</strong> requires <code>@hungpvq/vue-map-draw</code> — not
        yet ported to React. Use the Vue demo at <code>/inspect/</code>.
      </div>
    </MapPageShell>
  );
}
