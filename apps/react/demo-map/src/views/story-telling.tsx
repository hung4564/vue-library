import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapControl,
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  getMap,
  GotoControl,
  HomeControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { useCallback, useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './story-telling.css';

const CHAPTERS = [
  { id: '1', title: 'Zoom to Hanoi', duration: 3000 },
  { id: '2', title: 'Zoom to HCMC', duration: 3000 },
  { id: '3', title: 'Reset view', duration: 2000 },
];

export function StoryTellingPage() {
  const [mapId, setMapId] = useState('');
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    getMap(map.id, (m) => {
      m.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      m.addLayer({
        id: 'line-layer',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#FF0000',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    });
  }

  const runChapter = useCallback(
    (index: number) => {
      if (!mapId) return;
      getMap(mapId, (map) => {
        if (index === 0) {
          map.flyTo({ center: [105.8342, 21.0278], zoom: 10, duration: 2000 });
        } else if (index === 1) {
          map.flyTo({ center: [106.6297, 10.8231], zoom: 10, duration: 2000 });
        } else {
          map.flyTo({ center: [105.85, 21.0], zoom: 5, duration: 2000 });
        }
      });
    },
    [mapId],
  );

  function play() {
    setPlaying(true);
    let i = current;
    const tick = () => {
      setCurrent(i);
      runChapter(i);
      i += 1;
      if (i < CHAPTERS.length) {
        window.setTimeout(tick, CHAPTERS[i - 1]?.duration ?? 2000);
      } else {
        setPlaying(false);
      }
    };
    tick();
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <GotoControl position="top-right" />
        <CrsControl />
        <FullScreenControl />
        <GeoLocateControl />
        <ZoomControl />
        <HomeControl />
        <MeasurementControl />
        <MouseCoordinatesControl />
        <SettingControl />
        <BaseMapControl position="bottom-left" />
      </Map>
      <div className="story-panel">
        <h3>Story telling (React demo)</h3>
        <p>Simplified chapter playback — full action engine is in Vue demo.</p>
        <ul>
          {CHAPTERS.map((ch, idx) => (
            <li key={ch.id} className={idx === current ? 'active' : ''}>
              {ch.title}
            </li>
          ))}
        </ul>
        <div className="story-panel__actions">
          <button type="button" disabled={playing || !mapId} onClick={play}>
            Play
          </button>
          <button
            type="button"
            disabled={!mapId}
            onClick={() => {
              const next = Math.max(0, current - 1);
              setCurrent(next);
              runChapter(next);
            }}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={!mapId}
            onClick={() => {
              const next = Math.min(CHAPTERS.length - 1, current + 1);
              setCurrent(next);
              runChapter(next);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </MapPageShell>
  );
}
