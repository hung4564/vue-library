import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  BaseMapTagControl,
  Map
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  MapCard
} from '@hungpvq/react-map-core/fields';
import { useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './basemap.css';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

export function BasemapPage() {
  const [mapId, setMapId] = useState('');

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" showOpacity />
        <BaseMapTagControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
      {mapId ? (
        <div className="base-map-card-demo">
          <MapCard>
            <BaseMapCard mapId={mapId} showOpacity allowAddBasemap />
          </MapCard>
        </div>
      ) : null}
    </MapPageShell>
  );
}
