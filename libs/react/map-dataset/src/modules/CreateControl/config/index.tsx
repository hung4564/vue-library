import {
  applyCreateControlSample,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  CREATE_CONTROL_SAMPLE_NONE,
  GEOJSON_STYLE_AUTO,
  GIS_FILE_ACCEPT,
  getCreateControlDataTabs,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
  type CreateControlDataTab,
} from '@hungpvq/map-dataset';
import {
  BaseButton,
  DragDropFile,
  InputCrs,
  InputSelect,
  InputText,
  InputTextarea,
} from '@hungpvq/react-map-core';
import { useMemo, useRef, useState } from 'react';
import { DataSourceTabs } from './DataSourceTabs';

function looksCompleteGis(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  if (trimmed.startsWith('<') && /<\/[a-z]+>\s*$/i.test(trimmed)) return true;
  return /^(GEOMETRYCOLLECTION|MULTI(POINT|LINESTRING|POLYGON)|POINT|LINESTRING|POLYGON)\s*\([\s\S]*\)$/i.test(
    trimmed,
  );
}

type ConfigFormProps = {
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  trans: (key: string) => string;
};

export function ConfigGeojsonLayerSettings({ config, onChange, trans }: ConfigFormProps) {
  const styleItems = useMemo(
    () => [
      { value: GEOJSON_STYLE_AUTO, text: trans('map.layer-control.field.style-type-auto') },
      { value: 'point', text: 'point' },
      { value: 'line', text: 'line' },
      { value: 'area', text: 'area' },
    ],
    [trans],
  );

  return (
    <div className="map-row create-control-settings">
      <div className="map-col-6">
        <InputSelect
          label={trans('map.layer-control.field.style-type')}
          value={String(config.type ?? 'point')}
          items={styleItems}
          onChange={(v) => onChange({ type: v })}
        />
      </div>
      <div className="map-col-6">
        <div className="form-group">
          <label>{trans('map.layer-control.field.color')}</label>
          <div className="input-container create-control-color">
            <input
              type="color"
              value={String(config.color ?? '#3498db')}
              onChange={(event) => onChange({ color: event.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="map-col-12">
        <InputCrs
          label={trans('map.layer-control.field.crs')}
          placeholder={trans('map.layer-control.field.crs-placeholder')}
          value={String(config.crs ?? '4326')}
          onChange={(v) => onChange({ crs: v })}
        />
      </div>
    </div>
  );
}

export function ConfigGeojsonDataSource({ onChange, trans }: ConfigFormProps) {
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const dataTabs = getCreateControlDataTabs('vector');
  const [activeDataTab, setActiveDataTab] = useState<CreateControlDataTab>(
    CREATE_CONTROL_DEFAULT_DATA_TAB,
  );
  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('vector').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );

  function clearUrlState() {
    setSampleId('');
    setDataUrl('');
    setUrlError('');
  }

  async function applyGeojsonText(text: string) {
    setPasteText(text);
    clearUrlState();
    setParseError('');
    if (!text.trim()) {
      onChange({ geojson: null });
      return;
    }
    setParsing(true);
    try {
      const { geojson, crs } = await loadGisTextAsync(text);
      if (geojson) {
        const patch: Record<string, unknown> = { geojson };
        if (crs) patch.crs = crs;
        onChange(patch);
        setParseError('');
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
  }

  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    if (!id) return;
    const sample = getCreateControlSamples('vector').find((item) => item.id === id);
    if (!sample) return;
    setDataUrl(getCreateControlSampleUrl(sample));
  }

  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) => {
      const sample = getCreateControlSamples('vector').find(
        (item) => item.id === current,
      );
      if (sample && getCreateControlSampleUrl(sample) !== value.trim()) {
        return '';
      }
      return current;
    });
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;

    setLoadingUrl(true);
    setUrlError('');
    setPasteText('');
    try {
      const sample = getCreateControlSamples('vector').find(
        (item) =>
          item.id === sampleId && getCreateControlSampleUrl(item) === url,
      );
      if (sample) {
        const patch = await applyCreateControlSample(sample);
        onChange({ ...patch, name: sample.label });
      } else {
        const { geojson, crs } = await loadGisUrlAsync(url);
        const patch: Record<string, unknown> = { geojson };
        if (crs) patch.crs = crs;
        onChange(patch);
      }
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
                <DragDropFile
                  multiple
                  accept={GIS_FILE_ACCEPT}
                  onChange={async (input) => {
                    const files = Array.isArray(input) ? input : input ? [input] : [];
                    setParsing(true);
                    clearUrlState();
                    setParseError('');
                    try {
                      setPasteText('');
                      const { geojson, crs } = await loadGisFileAsync(files);
                      const patch: Record<string, unknown> = { geojson };
                      if (crs) patch.crs = crs;
                      onChange(patch);
                      setActiveDataTab(CREATE_CONTROL_DEFAULT_DATA_TAB);
                    } catch (err) {
                      setParseError(
                        err instanceof Error
                          ? err.message
                          : trans('map.layer-control.create.parse-error'),
                      );
                      onChange({ geojson: null });
                    } finally {
                      setParsing(false);
                    }
                  }}
                />
                <p className="create-control-status">
                  {trans('map.layer-control.create.file-hint')}
                </p>
                {parsing ? (
                  <div className="create-control-status">
                    {trans('map.layer-control.create.parsing')}
                  </div>
                ) : null}
                {parseError ? (
                  <div className="create-control-sample-error">{parseError}</div>
                ) : null}
              </>
            ),
            raw: (
              <>
                <InputTextarea
                  label={trans('map.layer-control.create.paste-geojson')}
                  value={pasteText}
                  rows={4}
                  onChange={(text) => {
                    setPasteText(text);
                    clearTimeout(pasteTimerRef.current);
                    pasteTimerRef.current = setTimeout(() => {
                      void applyGeojsonText(text);
                    }, 400);
                  }}
                />
                {parsing ? (
                  <div className="create-control-status">
                    {trans('map.layer-control.create.parsing')}
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
                <div className="create-control-url-row">
                  <InputText
                    label={trans('map.layer-control.field.url')}
                    value={dataUrl}
                    onChange={(v) => onUrlInput(v)}
                  />
                  <BaseButton
                    className="create-control-url-load"
                    disabled={loadingUrl || !dataUrl.trim()}
                    onClick={() => void onLoadUrl()}
                  >
                    {trans('map.layer-control.create.load')}
                  </BaseButton>
                </div>
                {loadingUrl ? (
                  <div className="create-control-status">
                    {trans('map.layer-control.create.loading-url')}
                  </div>
                ) : null}
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

export function ConfigRasterLayerSettings({ config, onChange, trans }: ConfigFormProps) {
  const bounds = (config.bounds as number[]) || [-180, -85.051129, 180, 85.051129];

  return (
    <div className="map-row create-control-settings">
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.minzoom')}
          value={String(config.minzoom ?? 0)}
          onChange={(v) => onChange({ minzoom: Number(v) })}
        />
      </div>
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.maxzoom')}
          value={String(config.maxzoom ?? 22)}
          onChange={(v) => onChange({ maxzoom: Number(v) })}
        />
      </div>
      {['minx', 'miny', 'maxx', 'maxy'].map((key, i) => (
        <div key={key} className="map-col-6">
          <InputText
            label={trans(`map.layer-control.field.bound.${key}`)}
            value={String(bounds[i] ?? '')}
            onChange={(v) => {
              const next = [...bounds];
              next[i] = Number(v);
              onChange({ bounds: next });
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function ConfigRasterDataSource({ config, onChange, trans }: ConfigFormProps) {
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  const dataTabs = getCreateControlDataTabs('rasterxyz');
  const [activeDataTab, setActiveDataTab] = useState<CreateControlDataTab>(
    CREATE_CONTROL_DEFAULT_DATA_TAB,
  );
  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('rasterxyz').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );

  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    if (!id) return;
    const sample = getCreateControlSamples('rasterxyz').find((item) => item.id === id);
    if (!sample) return;
    setDataUrl(getCreateControlSampleUrl(sample));
  }

  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) => {
      const sample = getCreateControlSamples('rasterxyz').find(
        (item) => item.id === current,
      );
      if (sample && getCreateControlSampleUrl(sample) !== value.trim()) {
        return '';
      }
      return current;
    });
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;

    setLoadingUrl(true);
    setUrlError('');
    try {
      const sample = getCreateControlSamples('rasterxyz').find(
        (item) =>
          item.id === sampleId && getCreateControlSampleUrl(item) === url,
      );
      if (sample) {
        const patch = await applyCreateControlSample(sample);
        onChange({ ...patch, name: sample.label });
      } else {
        onChange({ url, tiles: [url] });
      }
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
            raw: (
              <InputText
                label={trans('map.layer-control.field.url')}
                value={(config.url as string) || ''}
                onChange={(v) => {
                  setSampleId('');
                  setDataUrl('');
                  setUrlError('');
                  onChange({ url: v, tiles: v ? [v] : [] });
                }}
              />
            ),
            url: (
              <>
                <InputSelect
                  label={trans('map.layer-control.create.sample')}
                  value={sampleId}
                  items={sampleItems}
                  onChange={(v) => onSelectSample(String(v))}
                />
                <div className="create-control-url-row">
                  <InputText
                    label={trans('map.layer-control.field.url')}
                    value={dataUrl}
                    onChange={(v) => onUrlInput(v)}
                  />
                  <BaseButton
                    className="create-control-url-load"
                    disabled={loadingUrl || !dataUrl.trim()}
                    onClick={() => void onLoadUrl()}
                  >
                    {trans('map.layer-control.create.load')}
                  </BaseButton>
                </div>
                {loadingUrl ? (
                  <div className="create-control-status">
                    {trans('map.layer-control.create.loading-url')}
                  </div>
                ) : null}
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

const DATA_FORM_MAP: Record<string, typeof ConfigGeojsonDataSource> = {
  'create-geojson': ConfigGeojsonDataSource,
  'create-raster-json': ConfigRasterDataSource,
};

const SETTINGS_FORM_MAP: Record<string, typeof ConfigGeojsonLayerSettings> = {
  'create-geojson': ConfigGeojsonLayerSettings,
  'create-raster-json': ConfigRasterLayerSettings,
};

export function CreateConfigForm(props: {
  section: 'data' | 'settings';
  componentKey?: string;
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  trans: (key: string) => string;
}) {
  if (props.section === 'settings') {
    const Form =
      (props.componentKey && SETTINGS_FORM_MAP[props.componentKey]) || null;
    if (!Form) return null;
    return <Form {...props} />;
  }

  const Form =
    (props.componentKey && DATA_FORM_MAP[props.componentKey]) || ConfigGeojsonDataSource;
  return <Form {...props} />;
}

export function hasCreateConfigSettings(componentKey?: string) {
  return !!(componentKey && SETTINGS_FORM_MAP[componentKey]);
}
