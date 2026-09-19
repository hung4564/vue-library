import { getMap, type MapSimple } from '@hungpvq/map-core';
import {
  BaseMapControl,
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { MapCard } from '@hungpvq/react-map-core/fields';
import { loggerFactory } from '@hungpvq/shared-log';
import { useRef, useState } from 'react';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import {
  createCustomAction,
  createDrawRouteAction,
  createHighlightAction,
  createOrbitAction,
  createOrbitCurrentCenterAction,
  createPanAction,
  createRotateAction,
  createZoomAction,
} from './StoryTelling/helper-action';
import { useMapStorytelling } from './StoryTelling/useStorytelling';
import './story-telling.css';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

const storyLog = loggerFactory
  .createLogger()
  .setNamespace('demo:story', 0);

const chapters = [
  {
    id: '1',
    duration: 3000,
    actions: [createZoomAction([105.85, 21.03], 12)],
  },
  {
    id: '2',
    duration: 3000,
    actions: [createPanAction([105.82, 21.07])],
  },
  {
    id: '3',
    duration: 3000,
    actions: [createRotateAction(180)],
  },
  {
    id: '4',
    duration: 3000,
    actions: [
      createDrawRouteAction({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [105.84, 21.03],
                [105.85, 21.05],
                [105.86, 21.07],
              ],
            },
          },
        ],
      }),
    ],
  },
  {
    id: '5',
    duration: 3000,
    actions: [createHighlightAction('#btn-highlight')],
  },
  {
    id: '6',
    duration: 6000,
    actions: [createOrbitAction([105.85, 21.0], 0.005, 6000)],
  },
  {
    id: '8',
    duration: 3000,
    actions: [
      createCustomAction(
        'log',
        () =>
          storyLog
            .with({ fn: 'chapter9', span: 'story.chapter' })
            .info('Chapter 9 started'),
        () =>
          storyLog
            .with({ fn: 'chapter9', span: 'story.chapter' })
            .info('Chapter 9 ended'),
      ),
    ],
  },
  {
    id: '9',
    duration: 3000,
    actions: [createZoomAction([105.86, 21.08], 15)],
  },
  {
    id: '6b',
    duration: 6000,
    actions: [createOrbitCurrentCenterAction(0.005, 6000)],
  },
];

export function StoryTellingPage() {
  const [mapId, setMapId] = useState('');
  const mapIdRef = useRef('');
  mapIdRef.current = mapId;

  const { play, pause, next, prev, isPlaying, currentIndex } =
    useMapStorytelling(mapIdRef, {
      chapters,
      autoPlay: false,
      autoNext: true,
      loop: false,
    });

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    mapIdRef.current = map.id;
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

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <MeasurementControl position="top-right" />
        <GotoControl position="top-right" />
        <CrsControl />
        <SettingControl />
        <GeoLocateControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
        <DemoHelpPanel />
      </Map>
      <div className="buttons-container">
        <MapCard>
          <button type="button" disabled={!mapId} onClick={play}>
            Play
          </button>
          <button type="button" disabled={!mapId} onClick={pause}>
            Pause
          </button>
          <button type="button" disabled={!mapId} onClick={prev}>
            Prev
          </button>
          <button type="button" disabled={!mapId} onClick={next}>
            Next
          </button>
          <div style={{ padding: 8 }}>
            <div>Current: {currentIndex}</div>
            {isPlaying ? <div>Playing</div> : null}
            <div id="btn-highlight" />
          </div>
        </MapCard>
      </div>
    </MapPageShell>
  );
}
