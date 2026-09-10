import { getMap, type MapSimple } from '@hungpvq/map-core';
import {
  BaseMapControl,
  FullScreenControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { Marker } from 'maplibre-gl';
import { useCallback, useRef, useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './story-telling.css';

const GPS_TRACK = [
  { lng: 105.84146352698633, lat: 21.017689539749725, timestamp: 0 },
  { lng: 105.84146352698633, lat: 21.02072355063092, timestamp: 5 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 10 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 15 },
  { lng: 105.8467139857371, lat: 21.022567265547778, timestamp: 20 },
  { lng: 105.8486391539463, lat: 21.022030490139215, timestamp: 30 },
];

const TRAIL_SOURCE_ID = 'gps-trail';

export function StoryTellingGpsPage() {
  const [mapId, setMapId] = useState('');
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const markerRef = useRef<Marker | null>(null);
  const trailRef = useRef<[number, number][]>([]);
  const rafRef = useRef<number | null>(null);

  const updateTrail = useCallback(
    (coord: [number, number]) => {
      trailRef.current = [...trailRef.current, coord];
      if (!mapId) return;
      getMap(mapId, (map) => {
        const source = map.getSource(TRAIL_SOURCE_ID) as
          | { setData: (data: unknown) => void }
          | undefined;
        source?.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trailRef.current,
          },
        });
      });
    },
    [mapId],
  );

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    getMap(map.id, (m) => {
      const marker = new Marker({ color: 'red' });
      marker
        .setLngLat([GPS_TRACK[0].lng, GPS_TRACK[0].lat])
        .addTo(m as never);
      markerRef.current = marker;

      if (!m.getSource(TRAIL_SOURCE_ID)) {
        m.addSource(TRAIL_SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] },
          },
        });
        m.addLayer({
          id: TRAIL_SOURCE_ID,
          type: 'line',
          source: TRAIL_SOURCE_ID,
          paint: { 'line-color': '#FF0000', 'line-width': 4 },
        });
      }
      m.flyTo({
        center: [GPS_TRACK[0].lng, GPS_TRACK[0].lat],
        zoom: 12,
        duration: 0,
      });
    });
  }

  function stopAnim() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function play() {
    if (!mapId || !markerRef.current) return;
    stopAnim();
    setPlaying(true);
    trailRef.current = [];
    let index = 0;

    const runSegment = () => {
      if (index >= GPS_TRACK.length - 1) {
        setPlaying(false);
        setCurrent(GPS_TRACK.length - 1);
        return;
      }
      setCurrent(index);
      const start = GPS_TRACK[index];
      const end = GPS_TRACK[index + 1];
      const duration = Math.max((end.timestamp - start.timestamp) * 1000, 200);
      const startCoord: [number, number] = [start.lng, start.lat];
      const endCoord: [number, number] = [end.lng, end.lat];
      markerRef.current?.setLngLat(startCoord);
      updateTrail(startCoord);

      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        const lng = startCoord[0] + (endCoord[0] - startCoord[0]) * t;
        const lat = startCoord[1] + (endCoord[1] - startCoord[1]) * t;
        const coord: [number, number] = [lng, lat];
        markerRef.current?.setLngLat(coord);
        updateTrail(coord);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          index += 1;
          runSegment();
        }
      };
      rafRef.current = requestAnimationFrame(frame);
    };

    runSegment();
  }

  function reset() {
    stopAnim();
    setPlaying(false);
    setCurrent(0);
    trailRef.current = [];
    if (!mapId) return;
    getMap(mapId, (m) => {
      markerRef.current
        ?.setLngLat([GPS_TRACK[0].lng, GPS_TRACK[0].lat]);
      const source = m.getSource(TRAIL_SOURCE_ID) as
        | { setData: (data: unknown) => void }
        | undefined;
      source?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] },
      });
    });
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <GotoControl position="top-right" />
        <SettingControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
      </Map>
      <div className="story-panel">
        <h3>Story telling GPS</h3>
        <p>
          Point {current + 1} / {GPS_TRACK.length}
          {playing ? ' (playing)' : ''}
        </p>
        <div className="story-panel__actions">
          <button type="button" disabled={playing || !mapId} onClick={play}>
            Play trail
          </button>
          <button type="button" disabled={!mapId} onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </MapPageShell>
  );
}
