import {
  BaseMapControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { useState } from 'react';
import styles from './app.module.css';

export function App() {
  const [mapId] = useState('demo-map-' + Date.now());

  function onMapLoaded(map: any) {
    console.info('Map loaded:', map);
  }

  function onMapError(error: Error) {
    console.error('Map error:', error);
  }

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <Map mapId={mapId} onMapLoaded={onMapLoaded} onError={onMapError}>
          <GlobeControl />
          <SettingControl />
          <FullScreenControl />
          <ZoomControl />
          <HomeControl />
          <GeoLocateControl position="top-right" />
          <MouseCoordinatesControl />
          <BaseMapControl position="bottom-left" />
        </Map>
      </div>
    </div>
  );
}

export default App;
