import {
  buildCreateControlArchiveMetaChips,
  type CreateControlDataTab,
  type CreateControlLoadedSource,
  createControlLoadedSourceEyebrowKey,
  formatCreateControlBytes,
  getCreateControlDataTabs,
  loadCreateControlVectorTileFromFile,
  loadCreateControlVectorTileFromUrl,
} from '@hungpvq/map-dataset/create-control';
import { closeVectorTileArchive } from '@hungpvq/map-dataset/vector-tile';
import { MapControlButton } from '@hungpvq/react-map-core';
import {
  DragDropFile,
  InputActionRow,
  InputText,
} from '@hungpvq/react-map-core/fields';
import { useState } from 'react';

import { DataSourceTabs } from './DataSourceTabs';
import type { CreateConfigFormProps } from './types';

function archiveMetaChips(
  config: CreateConfigFormProps['config'],
  trans: CreateConfigFormProps['trans'],
  loaded: CreateControlLoadedSource | null,
) {
  if (!config.archiveId) return [];
  const chips = buildCreateControlArchiveMetaChips(
    {
      tileKind: config.tileKind as string | undefined,
      format: config.format as string | undefined,
      archiveKind: config.archiveKind as string | undefined,
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
  );
  if (typeof loaded?.bytes === 'number') {
    chips.push(formatCreateControlBytes(loaded.bytes));
  }
  return chips;
}

const ARCHIVE_CLEAR_PATCH = {
  url: '',
  tiles: [],
  archiveId: undefined,
  format: '',
  tileKind: 'vector',
  sourceLayer: '',
  sourceLayers: [],
  sourceLayerOptions: [],
  minzoom: 0,
  maxzoom: 22,
  bounds: [-180, -85.051129, 180, 85.051129],
};

/** PMTiles URL/file source — mirrors Vue `pmtiles-json.vue`. */
export function ConfigPmtilesJson({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [loadedSource, setLoadedSource] =
    useState<CreateControlLoadedSource | null>(null);
  const dataTabs = getCreateControlDataTabs('pmtiles');
  const [activeDataTab, setActiveDataTab] = useState<CreateControlDataTab>(
    dataTabs[0] ?? 'url',
  );

  const showLoaded = !!config.archiveId && !!loadedSource;
  const metaChips = archiveMetaChips(config, trans, loadedSource);

  async function clearLoaded() {
    const archiveId =
      typeof config.archiveId === 'string' ? config.archiveId : '';
    if (archiveId) {
      try {
        await closeVectorTileArchive(archiveId);
      } catch {
        /* ignore */
      }
    }
    onChange(ARCHIVE_CLEAR_PATCH);
    setLoadedSource(null);
    setDataUrl('');
    setFileError('');
    setUrlError('');
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;
    setLoadingUrl(true);
    setUrlError('');
    try {
      const { patch, loadedSource: next } =
        await loadCreateControlVectorTileFromUrl({
          url,
          sampleId: '',
          currentName: typeof config.name === 'string' ? config.name : '',
          layerKind: 'pmtiles',
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

  async function onFileChange(picked: File | File[]) {
    const file = Array.isArray(picked) ? picked[0] : picked;
    if (!(file instanceof File)) return;
    setLoadingFile(true);
    setFileError('');
    try {
      const { patch, loadedSource: next } =
        await loadCreateControlVectorTileFromFile(
          file,
          typeof config.name === 'string' ? config.name : '',
          'pmtiles',
        );
      onChange(patch);
      setLoadedSource(next);
    } catch (err) {
      setFileError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.parse-error'),
      );
    } finally {
      setLoadingFile(false);
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
                      loadedSource?.kind ?? 'file',
                    ),
                  )}
                </p>
                <p className="create-control-loaded__title">
                  {loadedSource?.label || (config.name as string) || 'PMTiles'}
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
          <DataSourceTabs
            activeTab={activeDataTab}
            tabs={dataTabs}
            onActiveTabChange={setActiveDataTab}
            trans={trans}
            children={{
              url: (
                <>
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
                      onChange={setDataUrl}
                    />
                  </InputActionRow>
                  {loadingUrl ? (
                    <div className="create-control-status">
                      {trans('map.layer-control.create.loading-url')}
                    </div>
                  ) : null}
                  {urlError ? (
                    <div className="create-control-sample-error">
                      {urlError}
                    </div>
                  ) : null}
                </>
              ),
              file: (
                <>
                  <div className="create-control-drop">
                    <DragDropFile
                      accept=".pmtiles,application/octet-stream"
                      onChange={onFileChange}
                    />
                    {loadingFile ? (
                      <div className="create-control-status--busy">
                        <span>{trans('map.layer-control.create.parsing')}</span>
                      </div>
                    ) : null}
                  </div>
                  <p className="create-control-status">
                    {trans('map.layer-control.create.file-hint-pmtiles')}
                  </p>
                  {fileError ? (
                    <div className="create-control-sample-error">
                      {fileError}
                    </div>
                  ) : null}
                </>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}
