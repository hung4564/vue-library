import type { DraftCoordinatesNumber } from '@hungpvq/map-core';
import { parseCoordinateListText } from '@hungpvq/map-core';
import {
  buildMeasurementGeojsonDownload,
  draftCoordinatesToFeature,
} from '@hungpvq/map-core/measurement';
import {
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiDownloadOutline,
  mdiPlus,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { saveAs } from 'file-saver';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { type ClipboardEvent, useMemo } from 'react';

type Coord = DraftCoordinatesNumber;

export interface FieldGeometryProps {
  value?: Coord[];
  maxLength?: number;
  title?: string;
  titleActionDownload?: string;
  titleActionFillBound?: string;
  titleActionAddPoint?: string;
  onChange?: (value: Coord[]) => void;
  onClickFillBound?: (geometry: Geometry | Feature | FeatureCollection) => void;
  onClickRemove?: (index: number) => void;
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

  /** Paste one pair or multi-line CSV into the list (from this row). */
  function onPasteCoordinate(
    event: ClipboardEvent<HTMLInputElement>,
    index: number,
  ) {
    const text = event.clipboardData.getData('text');
    const parsed = parseCoordinateListText(text);
    if (!parsed.length) return;
    event.preventDefault();

    let points = parsed.map(([lng, lat]) => [lng, lat] as Coord);
    if (maxLength > 0) {
      const room = Math.max(0, maxLength - index);
      points = points.slice(0, room);
    }
    if (!points.length) return;

    const next = [
      ...value.slice(0, index),
      ...points,
      ...value.slice(index + points.length),
    ];
    submit(
      maxLength > 0 && next.length > maxLength
        ? next.slice(0, maxLength)
        : next,
    );
  }

  function onDeleteItem(index: number) {
    const next = value.slice();
    next.splice(index, 1);
    onClickRemove?.(index);
    submit(next);
  }

  function onDownload() {
    const download = buildMeasurementGeojsonDownload(value);
    if (!download) return;
    saveAs(download.blob, download.fileName);
  }

  function onFlyTo() {
    const geom = draftCoordinatesToFeature(value);
    if (geom) onClickFillBound?.(geom);
  }

  return (
    <div className="map-measurement-geometry">
      <div className="map-measurement-geometry__header">
        {title ? (
          <div className="map-measurement-geometry__title">{title}</div>
        ) : null}
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
                onPaste={(e) => onPasteCoordinate(e, index)}
              />
            </div>
            <div>
              <input
                className="map-measurement-geometry__input"
                type="number"
                step="any"
                value={item[1] ?? ''}
                onChange={(e) => onUpdateCoord(index, 1, e.target.value)}
                onPaste={(e) => onPasteCoordinate(e, index)}
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
