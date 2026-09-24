import {
  applyCreateControlLayerName,
  assertCreateControlFileSize,
  buildCreateControlLoadedMetaChips,
  collectFileGdbFilesFromDataTransfer,
  createControlGeojsonPreviewPatch,
  type CreateControlLoadedSource,
  FILEGDB_FILE_ACCEPT,
  formatCreateControlParseStatus,
  looksLikeFileGdbFiles,
  parseCreateControlUploadedFiles,
  subscribeCreateControlParseProgress,
  summarizeCreateControlUploadFiles,
} from '@hungpvq/map-dataset/create-control';
import { terminateGeojsonWorker } from '@hungpvq/map-dataset/geojson';
import { MapControlButton } from '@hungpvq/react-map-core';
import { DragDropFile } from '@hungpvq/react-map-core/fields';
import { useMemo, useRef, useState } from 'react';

import type { CreateConfigFormProps } from './types';

function filterGdbUploadFiles(files: File[]): File[] {
  const nested = files.filter((file) =>
    (file.webkitRelativePath || file.name || '')
      .replace(/\\/g, '/')
      .toLowerCase()
      .includes('.gdb/'),
  );
  return nested.length ? nested : files;
}

/** FileGDB zip / folder upload — mirrors Vue `filegdb-upload.vue`. */
export function ConfigFilegdbUpload({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parseStatusText, setParseStatusText] = useState('');
  const [loadedSource, setLoadedSource] =
    useState<CreateControlLoadedSource | null>(null);
  const [replaceFileMode, setReplaceFileMode] = useState(false);
  const parseGeneration = useRef(0);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const showFileSummary =
    !!config.geojson && loadedSource?.kind === 'file' && !replaceFileMode;

  const loadedMetaChips = useMemo(
    () =>
      buildCreateControlLoadedMetaChips(loadedSource, {
        featuresCount: trans('map.layer-control.create.features-count'),
        geometryTypes: trans('map.layer-control.create.geometry-types'),
      }),
    [loadedSource, trans],
  );

  function syncGeojsonPreview(
    geojson: CreateConfigFormProps['config']['geojson'],
    crs?: string | null,
    layers?: Array<{ name: string; geojson: unknown }> | null,
  ) {
    const patch = createControlGeojsonPreviewPatch(
      geojson as never,
      crs ?? undefined,
      layers as never,
    );
    onChange(patch);
  }

  function clearLoadedData() {
    parseGeneration.current += 1;
    setLoadedSource(null);
    setReplaceFileMode(false);
    setParseError('');
    syncGeojsonPreview(null);
  }

  function cancelParsing() {
    parseGeneration.current += 1;
    terminateGeojsonWorker();
    setParsing(false);
    setParseStatusText('');
  }

  function openFolderPicker() {
    if (!folderInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.onchange = () => {
        const list = input.files;
        if (list?.length) void onChangeFile(Array.from(list));
        input.value = '';
      };
      folderInputRef.current = input;
    }
    folderInputRef.current.click();
  }

  async function onChangeFile(input: File | File[]) {
    const files = filterGdbUploadFiles(
      (Array.isArray(input) ? input : input ? [input] : []).filter(
        (file): file is File => file instanceof File,
      ),
    );
    if (!files.length) return;

    if (!looksLikeFileGdbFiles(files)) {
      setParseError(trans('map.layer-control.create.parse-error'));
      return;
    }

    const gen = ++parseGeneration.current;
    setParseError('');
    try {
      assertCreateControlFileSize(files);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.parse-error'),
      );
      syncGeojsonPreview(null);
      setLoadedSource(null);
      return;
    }

    const { totalBytes } = summarizeCreateControlUploadFiles(files);
    const parsingLabel = trans('map.layer-control.create.parsing');
    setParsing(true);
    setParseStatusText(
      formatCreateControlParseStatus(parsingLabel, totalBytes),
    );
    const unsubProgress = subscribeCreateControlParseProgress(
      parsingLabel,
      totalBytes,
      setParseStatusText,
    );
    try {
      const result = await parseCreateControlUploadedFiles(files);
      if (gen !== parseGeneration.current) return;
      const preview = createControlGeojsonPreviewPatch(
        result.geojson as never,
        result.crs ?? undefined,
        result.layers,
      );
      onChange({
        ...preview,
        name: applyCreateControlLayerName(
          typeof config.name === 'string' ? config.name : '',
          result.suggestedName,
          'filegdb',
        ),
      });
      setLoadedSource(result.loadedSource);
      setReplaceFileMode(false);
    } catch (err) {
      if (gen !== parseGeneration.current) return;
      setParseError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.parse-error'),
      );
      syncGeojsonPreview(null);
      setLoadedSource(null);
    } finally {
      unsubProgress();
      if (gen === parseGeneration.current) {
        setParsing(false);
        setParseStatusText('');
      }
    }
  }

  return (
    <div className="map-row create-control-settings">
      <div className="map-col-12">
        {showFileSummary ? (
          <div className="create-control-loaded">
            <div className="create-control-loaded__head">
              <div>
                <p className="create-control-loaded__eyebrow">
                  {trans('map.layer-control.create.loaded-from-file')}
                </p>
                <p className="create-control-loaded__title">
                  {loadedSource?.label}
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
                onClick={clearLoadedData}
              >
                {trans('map.layer-control.create.clear-data')}
              </MapControlButton>
            </div>
            {loadedMetaChips.length ? (
              <ul className="create-control-loaded__meta">
                {loadedMetaChips.map((chip) => (
                  <li key={chip} className="create-control-loaded__chip">
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="create-control-loaded__actions">
              <MapControlButton
                type="button"
                variant="outlined"
                onClick={() => setReplaceFileMode(true)}
              >
                {trans('map.layer-control.create.replace-file')}
              </MapControlButton>
            </div>
          </div>
        ) : null}

        {!showFileSummary || replaceFileMode ? (
          <>
            <div className="create-control-drop">
              <DragDropFile
                multiple
                accept={FILEGDB_FILE_ACCEPT}
                resolveDropFiles={collectFileGdbFilesFromDataTransfer}
                onChange={onChangeFile}
              />
              <div
                className="create-control-loaded__actions"
                style={{ marginTop: '0.75rem' }}
              >
                <MapControlButton
                  type="button"
                  variant="outlined"
                  onClick={openFolderPicker}
                >
                  {trans('map.layer-control.create.filegdb-choose-folder')}
                </MapControlButton>
              </div>
              {parsing ? (
                <div className="create-control-status--busy">
                  <span>
                    {parseStatusText ||
                      trans('map.layer-control.create.parsing')}
                  </span>
                  <MapControlButton
                    type="button"
                    variant="outlined"
                    onClick={cancelParsing}
                  >
                    {trans('map.layer-control.create.cancel')}
                  </MapControlButton>
                </div>
              ) : null}
            </div>
            <p className="create-control-status">
              {trans('map.layer-control.create.file-hint-filegdb')}
            </p>
            {parseError ? (
              <div className="create-control-sample-error">{parseError}</div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
