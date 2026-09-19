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
import * as turf from '@turf/turf';
import { GeoJSONSource, Marker } from 'maplibre-gl';
import { useMemo, useRef, useState } from 'react';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import { createZoomAction } from './StoryTelling/helper-action';
import { withMapReady } from './StoryTelling/helper-global';
import {
  type Chapter,
  useMapStorytelling,
} from './StoryTelling/useStorytelling';
import './story-telling.css';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

const storyGpsLog = loggerFactory
  .createLogger()
  .setNamespace('demo:story-gps', 0);

const GPS_TRACK = [
  { lng: 105.84146352698633, lat: 21.017689539749725, timestamp: 0 },
  { lng: 105.84146352698633, lat: 21.02072355063092, timestamp: 5 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 10 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 15 },
  { lng: 105.8467139857371, lat: 21.022567265547778, timestamp: 20 },
  { lng: 105.8486391539463, lat: 21.022030490139215, timestamp: 30 },
];

const TRAIL_SOURCE_ID = 'gps-trail';

function isValidCoordinate(coord: [number, number]): boolean {
  const [lng, lat] = coord;
  return (
    !isNaN(lng) && !isNaN(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90
  );
}

const isSameCoord = (a: [number, number], b: [number, number]) =>
  a[0] === b[0] && a[1] === b[1];

export function StoryTellingGpsPage() {
  const [mapId, setMapId] = useState('');
  const mapIdRef = useRef('');
  mapIdRef.current = mapId;

  const markerRef = useRef(new Marker({ color: 'red' }));
  const trailCoordsRef = useRef<[number, number][]>([]);

  const updateTrail = (coord: [number, number]) => {
    getMap(mapIdRef.current, (map) => {
      trailCoordsRef.current.push(coord);
      const source = map.getSource(TRAIL_SOURCE_ID) as GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: trailCoordsRef.current,
          },
        });
      }
    });
  };

  const chapters: Chapter[] = useMemo(() => {
    const list: Chapter[] = GPS_TRACK.map((point, index) => {
      const nextPoint = GPS_TRACK[index + 1];
      return {
        id: `point-${index}`,
        duration: nextPoint
          ? (nextPoint.timestamp - point.timestamp) * 1000
          : 1000,
        actions: [
          {
            type: 'moveMarkerTo',
            payload: {
              lng: point.lng,
              lat: point.lat,
            },
          },
          ...(nextPoint
            ? [
                {
                  type: 'animateSegment',
                  payload: {
                    segment: {
                      start: point,
                      end: nextPoint,
                      duration: (nextPoint.timestamp - point.timestamp) * 1000,
                    },
                  },
                },
              ]
            : []),
        ],
      };
    });
    list[0].actions?.push(
      createZoomAction([GPS_TRACK[0].lng, GPS_TRACK[0].lat], 12),
    );
    return list;
  }, []);

  const globalActions = useMemo(
    () => ({
      moveMarkerTo: ({ lng, lat }: { lng: number; lat: number }) => ({
        add: () => {
          markerRef.current.setLngLat([lng, lat]);
        },
      }),
      updateTrail: ({ coord }: { coord: [number, number] }) => ({
        add: () => {
          updateTrail(coord);
        },
      }),
      animateSegment: ({
        segment,
        speed = 1,
        onFinish,
      }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        segment: any;
        speed?: number;
        onFinish?: () => void;
      }) => ({
        add: () => {
          if (
            !segment ||
            !segment.start ||
            !segment.end ||
            !segment.duration
          ) {
            storyGpsLog
              .with({ fn: 'animateSegment', span: 'story.segment' })
              .error('Invalid segment data', segment);
            return;
          }

          const startCoord: [number, number] = [
            segment.start.lng,
            segment.start.lat,
          ];
          const endCoord: [number, number] = [
            segment.end.lng,
            segment.end.lat,
          ];

          if (isSameCoord(startCoord, endCoord)) {
            storyGpsLog
              .with({ fn: 'animateSegment', span: 'story.segment' })
              .warn('Skipping segment: start and end are identical');
            onFinish?.();
            return;
          }
          if (!isValidCoordinate(startCoord) || !isValidCoordinate(endCoord)) {
            storyGpsLog
              .with({ fn: 'animateSegment', span: 'story.segment' })
              .error(
                'Invalid coordinates for segment',
                startCoord,
                endCoord,
              );
            return;
          }

          const line = turf.lineString([startCoord, endCoord]);
          const distance = turf.length(line);
          const duration = segment.duration / speed;

          let startTime: number | null = null;

          function frame(now: number) {
            if (startTime === null) startTime = now;
            const elapsed = now - startTime;
            const t = Math.min(Math.max(elapsed / duration, 0), 1);

            const interpolated = turf.along(line, distance * t).geometry
              .coordinates as [number, number];

            markerRef.current.setLngLat(interpolated);
            updateTrail(interpolated);

            if (t < 1) {
              requestAnimationFrame(frame);
            } else {
              onFinish?.();
            }
          }

          requestAnimationFrame(frame);
        },
      }),
    }),
    [],
  );

  const { play, pause, next, prev, isPlaying, currentIndex } =
    useMapStorytelling(mapIdRef, {
      chapters,
      autoPlay: false,
      autoNext: true,
      loop: false,
      globalActions,
    });

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    mapIdRef.current = map.id;
    withMapReady(map.id, (m) => {
      markerRef.current
        .setLngLat([GPS_TRACK[0].lng, GPS_TRACK[0].lat])
        .addTo(m);
    });
    withMapReady(map.id, (m) => {
      if (!m.getSource(TRAIL_SOURCE_ID)) {
        m.addSource(TRAIL_SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [],
            },
          },
        });

        m.addLayer({
          id: TRAIL_SOURCE_ID,
          type: 'line',
          source: TRAIL_SOURCE_ID,
          paint: {
            'line-color': '#FF0000',
            'line-width': 4,
          },
        });
      }
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
