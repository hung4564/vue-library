import {
  CREATE_CONTROL_SAMPLE_NONE,
  buildCreateControlArchiveMetaChips,
  createControlLoadedSourceEyebrowKey,
  getCreateControlSamples,
  loadCreateControlTileJsonFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
  type CreateControlLoadedSource,
} from '@hungpvq/map-dataset/create-control';
import { MapControlButton } from '@hungpvq/react-map-core';
import {
  InputActionRow,
  InputSelect,
  InputText,
} from '@hungpvq/react-map-core/fields';
import { useMemo, useState } from 'react';
import type { CreateConfigFormProps } from './types';

const CLEAR_PATCH = {
  url: '',
  tiles: [],
  format: '',
  tileKind: 'vector',
  sourceLayer: '',
  sourceLayers: [],
  sourceLayerOptions: [],
  minzoom: 0,
  maxzoom: 22,
  bounds: [-180, -85.051129, 180, 85.051129],
};

/** TileJSON URL source — mirrors Vue `tilejson-json.vue`. */
export function ConfigTilejsonJson({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [loadedSource, setLoadedSource] =
    useState<CreateControlLoadedSource | null>(null);

  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('tilejson').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );

  const tiles = (config.tiles as string[] | undefined) ?? [];
  const showLoaded = !!loadedSource && tiles.length > 0;
  const metaChips = showLoaded
    ? buildCreateControlArchiveMetaChips(
        {
          tileKind: config.tileKind as string | undefined,
          format: config.format as string | undefined,
          name: config.name as string | undefined,
          minzoom: config.minzoom as number | undefined,
          maxzoom: config.maxzoom as number | undefined,
          bounds: config.bounds as number[] | undefined,
          sourceLayers: config.sourceLayers as string[] | undefined,
        },
        {
          tileKindVector: trans('map.layer-control.create.tile-kind-vector'),
          tileKindRaster: trans('map.layer-control.create.tile-kind-raster'),
          format: trans('map.layer-control.create.meta-format'),
          zoom: trans('map.layer-control.create.meta-zoom'),
          layers: trans('map.layer-control.create.meta-layers'),
          bounds: trans('map.layer-control.create.meta-bounds'),
        },
      )
    : [];

  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    const url = resolveCreateControlSampleSelection('tilejson', id);
    if (url != null) setDataUrl(url);
  }

  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) =>
      resolveCreateControlSampleIdAfterUrlEdit('tilejson', current, value),
    );
  }

  function clearLoaded() {
    onChange(CLEAR_PATCH);
    setLoadedSource(null);
    setUrlError('');
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;
    setLoadingUrl(true);
    setUrlError('');
    try {
      const { patch, loadedSource: next } =
        await loadCreateControlTileJsonFromUrl({
          url,
          sampleId,
          currentName: typeof config.name === 'string' ? config.name : '',
        });
      onChange(patch);
      setLoadedSource(next);
    } catch (err) {
      setUrlError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.url-error'),
      );
    } finally {
      setLoadingUrl(false);
    }
  }

  return (
    <div className="map-row create-control-settings">
      <div className="map-col-12">
        {showLoaded ? (
          <div className="create-control-loaded">
            <div className="create-control-loaded__head">
              <div>
                <p className="create-control-loaded__eyebrow">
                  {trans(
                    createControlLoadedSourceEyebrowKey(
                      loadedSource?.kind ?? 'url',
                    ),
                  )}
                </p>
                <p className="create-control-loaded__title">
                  {loadedSource?.label ||
                    (config.name as string) ||
                    'TileJSON'}
                </p>
                {loadedSource?.detail ? (
                  <p className="create-control-loaded__detail">
                    {loadedSource.detail}
                  </p>
                ) : null}
              </div>
              <MapControlButton
                type="button"
                variant="outlined"
                onClick={clearLoaded}
              >
                {trans('map.layer-control.create.clear-data')}
              </MapControlButton>
            </div>
            {metaChips.length ? (
              <ul className="create-control-loaded__meta">
                {metaChips.map((chip) => (
                  <li key={chip} className="create-control-loaded__chip">
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <>
            <InputSelect
              label={trans('map.layer-control.create.sample')}
              value={sampleId}
              items={sampleItems}
              onChange={(v) =>
                onSelectSample(typeof v === 'string' ? v : '')
              }
            />
            <InputActionRow
              action={
                <MapControlButton
                  disabled={loadingUrl || !dataUrl.trim()}
                  onClick={onLoadUrl}
                  variant="tonal"
                >
                  {trans('map.layer-control.create.load')}
                </MapControlButton>
              }
            >
              <InputText
                label={trans('map.layer-control.field.url')}
                value={dataUrl}
                onChange={onUrlInput}
              />
            </InputActionRow>
            <p className="create-control-status">
              {trans('map.layer-control.create.file-hint-tilejson')}
            </p>
            {loadingUrl ? (
              <div className="create-control-status">
                {trans('map.layer-control.create.loading-url')}
              </div>
            ) : null}
            {urlError ? (
              <div className="create-control-sample-error">{urlError}</div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
