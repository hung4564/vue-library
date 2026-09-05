import type { CoordinatesNumber, DraftCoordinatesNumber } from '@hungpvq/map-core';
import {
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiDownloadOutline,
  mdiPlus,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { lineString, point, polygon } from '@turf/helpers';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { saveAs } from 'file-saver';
import { useMemo } from 'react';

type Coord = DraftCoordinatesNumber;

export interface FieldGeometryProps {
  value?: Coord[];
  maxLength?: number;
  title?: string;
  titleActionDownload?: string;
  titleActionFillBound?: string;
  titleActionAddPoint?: string;
  onChange?: (value: Coord[]) => void;
  onClickFillBound?: (
    geometry: Geometry | Feature | FeatureCollection,
  ) => void;
  onClickRemove?: (index: number) => void;
}

function toGeometry(coordinates: Coord[]) {
  const validCoords = coordinates.filter(
    (c): c is CoordinatesNumber => c[0] !== null && c[1] !== null,
  );
  if (!validCoords.length) return undefined;
  if (validCoords.length === 1) return point(validCoords[0]);
  if (validCoords.length === 2) return lineString(validCoords);
  return polygon([[...validCoords, validCoords[0]]]);
}

export function FieldGeometry({
  value = [],
  maxLength = 0,
  title,
  titleActionDownload,
  titleActionFillBound,
  titleActionAddPoint,
  onChange,
  onClickFillBound,
  onClickRemove,
}: FieldGeometryProps) {
  const isCanAdd = useMemo(
    () => !maxLength || value.length < maxLength,
    [maxLength, value.length],
  );

  function submit(next: Coord[]) {
    onChange?.([...next]);
  }

  function onAddItem() {
    submit([...value, [null, null]]);
  }

  function onUpdateCoord(index: number, axis: 0 | 1, raw: string) {
    const next = value.map((item, i) => {
      if (i !== index) return item;
      const copy: Coord = [...item] as Coord;
      copy[axis] = raw === '' ? null : Number(raw);
      return copy;
    });
    submit(next);
  }

  function onDeleteItem(index: number) {
    const next = value.slice();
    next.splice(index, 1);
    onClickRemove?.(index);
    submit(next);
  }

  function onDownload() {
    const geom = toGeometry(value);
    if (!geom) return;
    const geojson = {
      type: 'FeatureCollection',
      features: [geom],
    };
    const blob = new Blob([JSON.stringify(geojson)], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'geojson.json');
  }

  function onFlyTo() {
    const geom = toGeometry(value);
    if (geom) onClickFillBound?.(geom);
  }

  return (
    <div className="map-measurement-geometry">
      <div className="map-measurement-geometry__header">
        <div className="map-measurement-geometry__title">{title}</div>
        <div className="map-measurement-geometry__actions">
          <button
            type="button"
            onClick={onFlyTo}
            disabled={!value.length}
            className="map-measurement-geometry__btn"
            title={titleActionFillBound}
          >
            <Icon path={mdiCrosshairsGps} size="16px" />
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="map-measurement-geometry__btn"
            disabled={!value.length}
            title={titleActionDownload}
          >
            <Icon path={mdiDownloadOutline} size="16px" />
          </button>
          {isCanAdd ? (
            <button
              type="button"
              onClick={onAddItem}
              className="map-measurement-geometry__btn"
              title={titleActionAddPoint}
            >
              <Icon path={mdiPlus} size="16px" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="map-measurement-geometry__list">
        {value.map((item, index) => (
          <div className="map-measurement-geometry__item" key={index}>
            <div>#{index + 1}</div>
            <div>
              <input
                className="map-measurement-geometry__input"
                type="number"
                step="any"
                value={item[0] ?? ''}
                onChange={(e) => onUpdateCoord(index, 0, e.target.value)}
              />
            </div>
            <div>
              <input
                className="map-measurement-geometry__input"
                type="number"
                step="any"
                value={item[1] ?? ''}
                onChange={(e) => onUpdateCoord(index, 1, e.target.value)}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => onDeleteItem(index)}
                className="map-measurement-geometry__btn"
              >
                <Icon path={mdiDeleteOutline} size="16px" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
