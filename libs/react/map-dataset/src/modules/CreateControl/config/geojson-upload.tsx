import {
  applyCreateControlLayerName,
  assertCreateControlFileSize,
  buildCreateControlLoadedMetaChips,
  createControlGeojsonPreviewPatch,
  createControlLoadedSourceEyebrowKey,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  CREATE_CONTROL_SAMPLE_NONE,
  collectFilesFromDataTransfer,
  formatCreateControlParseStatus,
  GIS_FILE_ACCEPT,
  getCreateControlDataTabs,
  getCreateControlSamples,
  loadCreateControlVectorFromUrl,
  looksCompleteGis,
  parseCreateControlPastedText,
  parseCreateControlUploadedFiles,
  readClipboardGisPaste,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
  subscribeCreateControlParseProgress,
  summarizeCreateControlUploadFiles,
  type CreateControlDataTab,
  type CreateControlLoadedSource,
} from '@hungpvq/map-dataset/create-control';
import { terminateGeojsonWorker } from '@hungpvq/map-dataset/geojson';
import { MapControlButton } from '@hungpvq/react-map-core';
import { DragDropFile, InputActionRow, InputSelect, InputText, InputTextarea } from '@hungpvq/react-map-core/fields';
import type { GeoJSON } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DataSourceTabs } from './DataSourceTabs';
import type { CreateConfigFormProps } from './types';

/** GeoJSON data source — mirrors Vue `geojson-upload.vue`. */
export function GeojsonUpload({ config, onChange, trans }: CreateConfigFormProps) {
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parseStatusText, setParseStatusText] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [loadedSource, setLoadedSource] = useState<CreateControlLoadedSource | null>(null);
  const [replaceFileMode, setReplaceFileMode] = useState(false);
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const parseGenerationRef = useRef(0);
  const dataTabs = getCreateControlDataTabs('geojson');
  const [activeDataTab, setActiveDataTab] = useState<CreateControlDataTab>(
    CREATE_CONTROL_DEFAULT_DATA_TAB,
  );
  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('geojson').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );

  const geojson = config.geojson as GeoJSON | null | undefined;
  const showLoadedRawCard =
    !!geojson &&
    !!loadedSource &&
    (loadedSource.kind === 'file' || loadedSource.kind === 'url');
  const showFileSummary =
    !!geojson && loadedSource?.kind === 'file' && !replaceFileMode;
  const metaChips = buildCreateControlLoadedMetaChips(loadedSource, {
    featuresCount: trans('map.layer-control.create.features-count'),
    geometryTypes: trans('map.layer-control.create.geometry-types'),
  });

  function clearUrlState() {
    setSampleId('');
    setDataUrl('');
    setUrlError('');
  }

  function syncGeojsonPreview(next: GeoJSON | null, crs?: string | null) {
    onChange(createControlGeojsonPreviewPatch(next, crs));
  }

  function clearLoadedData() {
    parseGenerationRef.current += 1;
    setPasteText('');
    setLoadedSource(null);
    setReplaceFileMode(false);
    setParseError('');
    syncGeojsonPreview(null);
    clearUrlState();
  }

  function cancelParsing() {
    parseGenerationRef.current += 1;
    terminateGeojsonWorker();
    setParsing(false);
    setParseStatusText('');
  }

  useEffect(() => {
    return () => {
      clearTimeout(pasteTimerRef.current);
      parseGenerationRef.current += 1;
      terminateGeojsonWorker();
    };
  }, []);

  async function onChangeFile(input: File | File[]) {
    const files = Array.isArray(input) ? input : input ? [input] : [];
    const gen = ++parseGenerationRef.current;
    clearUrlState();
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
    setParseStatusText(formatCreateControlParseStatus(parsingLabel, totalBytes));
    const unsubProgress = subscribeCreateControlParseProgress(
      parsingLabel,
      totalBytes,
      setParseStatusText,
    );
    try {
      setPasteText('');
      const result = await parseCreateControlUploadedFiles(files);
      if (gen !== parseGenerationRef.current) return;
      onChange({
        ...createControlGeojsonPreviewPatch(result.geojson, result.crs),
        name: applyCreateControlLayerName(
          typeof config.name === 'string' ? config.name : '',
          result.suggestedName,
          'geojson',
        ),
      });
      setLoadedSource(result.loadedSource);
      setReplaceFileMode(false);
      setActiveDataTab(CREATE_CONTROL_DEFAULT_DATA_TAB);
    } catch (err) {
      if (gen !== parseGenerationRef.current) return;
      setParseError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.parse-error'),
      );
      syncGeojsonPreview(null);
      setLoadedSource(null);
    } finally {
      unsubProgress();
      if (gen === parseGenerationRef.current) {
        setParsing(false);
        setParseStatusText('');
      }
    }
  }

  function onOsClipboardPaste(event: React.ClipboardEvent) {
    const { files, text } = readClipboardGisPaste(event.clipboardData);
    if (files.length) {
      event.preventDefault();
      void onChangeFile(files);
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    event.preventDefault();
    setActiveDataTab('raw');
    onPasteGeojson(trimmed);
  }

  function onPasteGeojson(text: string) {
    setPasteText(text);
    clearUrlState();
    setParseError('');
    clearTimeout(pasteTimerRef.current);
    if (!text.trim()) {
      syncGeojsonPreview(null);
      setLoadedSource(null);
      return;
    }
    pasteTimerRef.current = setTimeout(async () => {
      setParsing(true);
      try {
        const result = await parseCreateControlPastedText(
          text,
          trans('map.layer-control.create.loaded-from-paste'),
        );
        setParseError('');
        if (result) {
          syncGeojsonPreview(result.geojson, result.crs);
          setLoadedSource(result.loadedSource);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : trans('map.layer-control.create.parse-error');
        if (looksCompleteGis(text)) setParseError(message);
      } finally {
        setParsing(false);
      }
    }, 400);
  }

  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    const url = resolveCreateControlSampleSelection('geojson', id);
    if (url != null) setDataUrl(url);
  }

  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) =>
      resolveCreateControlSampleIdAfterUrlEdit('geojson', current, value),
    );
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;
    setLoadingUrl(true);
    setUrlError('');
    setPasteText('');
    try {
      const { patch, loadedSource: nextSource } = await loadCreateControlVectorFromUrl({
        url,
        sampleId,
        currentName: typeof config.name === 'string' ? config.name : '',
      });
      onChange(patch);
      setLoadedSource(nextSource);
      setReplaceFileMode(false);
      setActiveDataTab(CREATE_CONTROL_DEFAULT_DATA_TAB);
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
        <DataSourceTabs
          tabs={dataTabs}
          trans={trans}
          activeTab={activeDataTab}
          onActiveTabChange={setActiveDataTab}
        >
          {{
            file: (
              <>
                {showFileSummary && loadedSource ? (
                  <div className="create-control-loaded">
                    <div className="create-control-loaded__head">
                      <div>
                        <p className="create-control-loaded__eyebrow">
                          {trans('map.layer-control.create.loaded-from-file')}
                        </p>
                        <p className="create-control-loaded__title">{loadedSource.label}</p>
                        {loadedSource.detail ? (
                          <p className="create-control-loaded__detail">{loadedSource.detail}</p>
                        ) : null}
                      </div>
                      <MapControlButton type="button" onClick={clearLoadedData} variant="outlined">
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
                    <div className="create-control-loaded__actions">
                      <MapControlButton variant="outlined" type="button" onClick={() => setReplaceFileMode(true)}>
                        {trans('map.layer-control.create.replace-file')}
                      </MapControlButton>
                    </div>
                  </div>
                ) : null}

                {!showFileSummary || replaceFileMode ? (
                  <>
                    <div
                      className="create-control-drop"
                      tabIndex={0}
                      onPaste={onOsClipboardPaste}
                    >
                      <DragDropFile
                        multiple
                        accept={GIS_FILE_ACCEPT}
                        resolveDropFiles={collectFilesFromDataTransfer}
                        onChange={(input) => void onChangeFile(input)}
                      />
                      {parsing ? (
                        <div className="create-control-status--busy">
                          <span>
                            {parseStatusText || trans('map.layer-control.create.parsing')}
                          </span>
                          <MapControlButton type="button" onClick={cancelParsing} variant="outlined">
                            {trans('map.layer-control.create.cancel')}
                          </MapControlButton>
                        </div>
                      ) : null}
                    </div>
                    <p className="create-control-status">
                      {trans('map.layer-control.create.file-hint')}
                    </p>
                  </>
                ) : null}
                {parseError ? (
                  <div className="create-control-sample-error">{parseError}</div>
                ) : null}
              </>
            ),
            raw: showLoadedRawCard && loadedSource ? (
              <div className="create-control-loaded">
                <div className="create-control-loaded__head">
                  <div>
                    <p className="create-control-loaded__eyebrow">
                      {trans(createControlLoadedSourceEyebrowKey(loadedSource.kind))}
                    </p>
                    <p className="create-control-loaded__title">{loadedSource.label}</p>
                    {loadedSource.detail ? (
                      <p className="create-control-loaded__detail">{loadedSource.detail}</p>
                    ) : null}
                  </div>
                  <MapControlButton type="button" onClick={clearLoadedData} variant="outlined">
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
                <InputTextarea
                  label={trans('map.layer-control.create.paste-geojson')}
                  placeholder={trans('map.layer-control.create.paste-geojson-hint')}
                  value={pasteText}
                  rows={4}
                  onChange={onPasteGeojson}
                />
                {parsing ? (
                  <div className="create-control-status--row">
                    <span>{trans('map.layer-control.create.parsing')}</span>
                  </div>
                ) : null}
                {parseError ? (
                  <div className="create-control-sample-error">{parseError}</div>
                ) : null}
              </>
            ),
            url: (
              <>
                <InputSelect
                  label={trans('map.layer-control.create.sample')}
                  value={sampleId}
                  items={sampleItems}
                  onChange={(v) => onSelectSample(String(v))}
                />
                <InputActionRow
                  action={
                    <MapControlButton
                      variant="tonal"
                      disabled={loadingUrl || !dataUrl.trim()}
                      onClick={() => void onLoadUrl()}
                    >
                      {loadingUrl
                        ? trans('map.layer-control.create.loading-url')
                        : trans('map.layer-control.create.load')}
                    </MapControlButton>
                  }
                >
                  <InputText
                    label={trans('map.layer-control.field.url')}
                    value={dataUrl}
                    onChange={(v) => onUrlInput(v)}
                  />
                </InputActionRow>
                {urlError ? (
                  <div className="create-control-sample-error">{urlError}</div>
                ) : null}
              </>
            ),
          }}
        </DataSourceTabs>
      </div>
    </div>
  );
}
