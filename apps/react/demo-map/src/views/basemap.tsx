import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  BaseMapTagControl,
  Map,
  MapCard,
} from '@hungpvq/react-map-core';
import { useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './basemap.css';

export function BasemapPage() {
  const [mapId, setMapId] = useState('');

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <BaseMapTagControl position="bottom-left" />
      </Map>
      {mapId ? (
        <div className="base-map-card-demo">
          <MapCard>
            <BaseMapCard mapId={mapId} />
          </MapCard>
        </div>
      ) : null}
    </MapPageShell>
  );
}
